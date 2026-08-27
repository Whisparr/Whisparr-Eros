import { pingServer, setAppValue } from 'App/appStore';
import useApiMutation from 'Helpers/Hooks/useApiMutation';

// The two thunks these replace never wrote to a reducer -- `systemActions` has
// held an empty `defaultState` since status, health, tasks, backups, updates
// and logs became queries. All `restart` ever did with its response was flip
// the app store's `isRestarting` and start the ping loop that clears it, and
// that is what `onSuccess` does here.
export const useRestart = () => {
  return useApiMutation<void, void>({
    path: '/system/restart',
    method: 'POST',
    mutationOptions: {
      onSuccess: () => {
        setAppValue({ isRestarting: true });
        pingServer();
      },
    },
  });
};

export const useShutdown = () => {
  return useApiMutation<void, void>({
    path: '/system/shutdown',
    method: 'POST',
  });
};
