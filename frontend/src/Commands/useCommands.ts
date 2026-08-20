import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { messageTypes } from 'Helpers/Props';
import { showMessage } from 'Store/Actions/appActions';
import {
  findCommand,
  isCommandExecuting,
  isSameCommand,
} from 'Utilities/Command';
import Command, { CommandBody, NewCommandBody } from './Command';

export const COMMANDS_QUERY_KEY = ['/command'];

const DEFAULT_COMMANDS: Command[] = [];

// The slice removed finished commands on a five-minute timer of its own. The server
// already drops them from this endpoint, so re-syncing on the same interval does the
// same job without a timer per command.
const COMMAND_REFETCH_INTERVAL = 5 * 60 * 1000;

// Deliberately module scope, not a ref: the component that started a command is often
// unmounted by the time SignalR reports it finished.
const commandFinishedCallbacks: Record<number, (command: Command) => void> = {};

// Also module scope, as the slice had it. The guard is about the command, not about the
// component that happened to launch it -- two different buttons for the same search
// should not both fire.
let lastCommand: { body: NewCommandBody; at: number } | null = null;

function isRepeatOfLastCommand(body: NewCommandBody) {
  const now = Date.now();

  if (
    lastCommand &&
    now - lastCommand.at < 5000 &&
    isSameCommand(lastCommand.body, body)
  ) {
    console.warn(
      'Please wait at least 5 seconds before running this command again'
    );

    return true;
  }

  lastCommand = { body, at: now };

  return false;
}

export const useCommands = () => {
  const result = useApiQuery<Command[]>({
    path: '/command',
    queryOptions: { refetchInterval: COMMAND_REFETCH_INTERVAL },
  });

  return {
    ...result,
    data: result.data ?? DEFAULT_COMMANDS,
  };
};

export default useCommands;

export const useCommand = (
  name: string,
  constraints: Partial<CommandBody> = {}
) => {
  const { data } = useCommands();

  const key = JSON.stringify(constraints);

  return useMemo(
    () => findCommand(data, { name, ...JSON.parse(key) }),
    [data, name, key]
  );
};

export const useCommandExecuting = (
  name: string,
  constraints: Partial<CommandBody> = {}
) => {
  return isCommandExecuting(useCommand(name, constraints));
};

export const useExecutingCommands = () => {
  const { data } = useCommands();

  return useMemo(() => data.filter(isCommandExecuting), [data]);
};

const useWriteCommand = () => {
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      upsert(command: Command) {
        queryClient.setQueryData<Command[]>(
          COMMANDS_QUERY_KEY,
          (existing = DEFAULT_COMMANDS) =>
            existing.some((c) => c.id === command.id)
              ? existing.map((c) => (c.id === command.id ? command : c))
              : [...existing, command]
        );
      },

      remove(id: number) {
        queryClient.setQueryData<Command[]>(
          COMMANDS_QUERY_KEY,
          (existing = DEFAULT_COMMANDS) => existing.filter((c) => c.id !== id)
        );
      },
    }),
    [queryClient]
  );
};

const useCommandMutation = () => {
  const cache = useWriteCommand();

  return useApiMutation<Command, NewCommandBody>({
    method: 'POST',
    path: '/command',
    mutationOptions: {
      onSuccess: (command) => {
        cache.upsert(command);
      },
    },
  });
};

export const useExecuteCommand = () => {
  const { mutate } = useCommandMutation();

  return useCallback(
    (body: NewCommandBody, commandFinished?: (command: Command) => void) => {
      if (isRepeatOfLastCommand(body)) {
        return;
      }

      mutate(body, {
        onSuccess: (command) => {
          if (commandFinished) {
            commandFinishedCallbacks[command.id] = commandFinished;
          }
        },
      });
    },
    [mutate]
  );
};

// For the one caller that needs the created command's id back -- the calendar tracks the
// search it started so it can show progress against that specific command.
export const useExecuteCommandAsync = () => {
  const { mutateAsync } = useCommandMutation();

  return useCallback(
    async (body: NewCommandBody) => {
      if (isRepeatOfLastCommand(body)) {
        return undefined;
      }

      return mutateAsync(body);
    },
    [mutateAsync]
  );
};

export const useCancelCommand = (id: number) => {
  const cache = useWriteCommand();

  const { mutate, isPending, error } = useApiMutation<void, void>({
    method: 'DELETE',
    path: `/command/${id}`,
    mutationOptions: {
      onSuccess: () => {
        cache.remove(id);
      },
    },
  });

  return {
    cancelCommand: mutate,
    isCancellingCommand: isPending,
    commandCancelError: error,
  };
};

// Applies a command pushed over SignalR. Messages still live in the redux app slice --
// this is their only producer, and they convert with the rest of the app shell.
export const useUpdateCommand = () => {
  const cache = useWriteCommand();
  const dispatch = useDispatch();

  return useCallback(
    (command: Command) => {
      cache.upsert(command);

      const { id, name, trigger, message, body, status } = command;

      if (message && body?.sendUpdatesToClient && !body.suppressMessages) {
        let type = messageTypes.INFO;
        let hideAfter = 0;

        if (status === 'completed') {
          type = messageTypes.SUCCESS;
          hideAfter = 4;
        } else if (status === 'failed') {
          type = messageTypes.ERROR;
          hideAfter = trigger === 'manual' ? 10 : 4;
        }

        dispatch(showMessage({ id, name, message, type, hideAfter }));
      }

      // Failed commands need finishing too, or their button spins until it times out.
      if (status === 'completed' || status === 'failed') {
        const commandFinished = commandFinishedCallbacks[id];

        if (commandFinished) {
          commandFinished(command);
          delete commandFinishedCallbacks[id];
        }
      }
    },
    [cache, dispatch]
  );
};
