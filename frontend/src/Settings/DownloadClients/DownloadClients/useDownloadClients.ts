import { useCallback, useMemo } from 'react';
import DownloadProtocol from 'DownloadClient/DownloadProtocol';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import {
  SelectedSchema,
  useProviderSchema,
  useSelectedSchema,
} from 'Settings/useProviderSchema';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';
import DownloadClient from 'typings/DownloadClient';
import sortByProp from 'Utilities/Array/sortByProp';

export const DOWNLOAD_CLIENTS_PATH = '/downloadclient';

const NO_DOWNLOAD_CLIENT = {} as DownloadClient;

export const useDownloadClients = () => {
  return useProviderSettings<DownloadClient>(DOWNLOAD_CLIENTS_PATH);
};

export const useSortedDownloadClients = () => {
  const { data } = useDownloadClients();

  return useMemo(() => [...data].sort(sortByProp('name')), [data]);
};

export const useDownloadClientsWithIds = (ids: number[]) => {
  const { data } = useDownloadClients();

  return useMemo(
    () => data.filter((downloadClient) => ids.includes(downloadClient.id)),
    [data, ids]
  );
};

// The grab-with-an-override flows offer the clients that could actually take
// the release: right protocol, and switched on.
export const useEnabledDownloadClients = (protocol: DownloadProtocol) => {
  const { data, ...result } = useDownloadClients();

  const items = useMemo(() => {
    return data
      .filter(
        (downloadClient) =>
          downloadClient.protocol === protocol && downloadClient.enable
      )
      .sort(sortByProp('name'));
  }, [data, protocol]);

  return { ...result, items };
};

export const useDownloadClientSchema = (enabled = true) => {
  return useProviderSchema<DownloadClient>(DOWNLOAD_CLIENTS_PATH, enabled);
};

export const useDeleteDownloadClient = (id: number) => {
  const { deleteProvider, ...result } = useDeleteProvider<DownloadClient>(
    id,
    DOWNLOAD_CLIENTS_PATH
  );

  return {
    ...result,
    deleteDownloadClient: deleteProvider,
  };
};

// Adding from the schema takes the implementation's defaults and switches the
// client on, which is what `SELECT_DOWNLOAD_CLIENT_SCHEMA` did through
// `selectProviderSchema`.
export const useManageDownloadClient = (
  id: number,
  selectedSchema?: SelectedSchema
) => {
  const isAdding = id === 0;

  const schema = useSelectedSchema<DownloadClient>(
    DOWNLOAD_CLIENTS_PATH,
    selectedSchema
  );

  // Same query key as the lookup inside `useSelectedSchema`, so this reads the
  // one request rather than making a second.
  const { isSchemaLoading, isSchemaFetched, schemaError } =
    useDownloadClientSchema(isAdding);

  const defaultDownloadClient = useMemo(() => {
    if (!schema) {
      return NO_DOWNLOAD_CLIENT;
    }

    return {
      ...schema,
      name: selectedSchema?.presetName ?? schema.implementationName,
      enable: true,
    };
  }, [schema, selectedSchema]);

  const manage = useManageProviderSettings<DownloadClient>(
    id,
    defaultDownloadClient,
    DOWNLOAD_CLIENTS_PATH
  );

  return {
    ...manage,

    // Only the add-from-schema case has anything to wait for; an edit comes
    // from the list the page already loaded.
    isFetching: isAdding && isSchemaLoading,
    isFetched: isAdding ? isSchemaFetched : true,
    error: isAdding ? schemaError : null,
  };
};

// `/downloadclient/testall` reports per-client results in its body, which
// nothing has ever read -- the redux handler discarded them too, and both
// callers show only the spinner. Carried over as-is, the same way #538 carried
// the indexer one.
export const useTestAllDownloadClients = () => {
  const { mutate, isPending } = useApiMutation<unknown, void>({
    path: `${DOWNLOAD_CLIENTS_PATH}/testall`,
    method: 'POST',
  });

  return {
    testAllDownloadClients: mutate,
    isTestingAll: isPending,
  };
};

export interface BulkEditDownloadClients {
  ids: number[];
  tags?: number[];
  applyTags?: string;
  enable?: boolean;
  priority?: number;
  removeCompletedDownloads?: boolean;
  removeFailedDownloads?: boolean;
}

// `onSettled` rather than `onSuccess`, because the caller uses it to clear the
// which-button-is-spinning flag and a failed bulk edit has to clear it too.
export const useBulkEditDownloadClients = (onSettled?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    DownloadClient[],
    BulkEditDownloadClients
  >({
    path: `${DOWNLOAD_CLIENTS_PATH}/bulk`,
    method: 'PUT',
    mutationOptions: {
      onSuccess: (updatedDownloadClients) => {
        queryClient.setQueryData<DownloadClient[]>(
          [DOWNLOAD_CLIENTS_PATH],
          (downloadClients = []) => {
            return downloadClients.map((downloadClient) => {
              return (
                updatedDownloadClients.find(
                  (updated) => updated.id === downloadClient.id
                ) ?? downloadClient
              );
            });
          }
        );
      },
      onSettled,
    },
  });

  return {
    bulkEditDownloadClients: mutate,
    isSaving: isPending,
    saveError: error,
  };
};

export const useBulkDeleteDownloadClients = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<void, { ids: number[] }>({
    path: `${DOWNLOAD_CLIENTS_PATH}/bulk`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: (_data, { ids }) => {
        queryClient.setQueryData<DownloadClient[]>(
          [DOWNLOAD_CLIENTS_PATH],
          (downloadClients = []) => {
            return downloadClients.filter(
              (downloadClient) => !ids.includes(downloadClient.id)
            );
          }
        );

        onSuccess?.();
      },
    },
  });

  const bulkDeleteDownloadClients = useCallback(
    (ids: number[]) => mutate({ ids }),
    [mutate]
  );

  return {
    bulkDeleteDownloadClients,
    isDeleting: isPending,
    deleteError: error,
  };
};
