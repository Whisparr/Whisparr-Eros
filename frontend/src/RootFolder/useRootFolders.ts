import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import RootFolder from 'typings/RootFolder';
import sortByProp from 'Utilities/Array/sortByProp';

export const ROOT_FOLDERS_QUERY_KEY = ['/rootFolder'];

const DEFAULT_ROOT_FOLDERS: RootFolder[] = [];

// Free space and import file counts come off the disk, so this list goes stale
// for reasons the app cannot see. It keeps the client's default staleTime and
// leans on the `rootfolder` SignalR message for the rest.
const useRootFolders = () => {
  const result = useApiQuery<RootFolder[]>({
    path: '/rootFolder',
  });

  return {
    ...result,
    data: result.data ?? DEFAULT_ROOT_FOLDERS,
  };
};

export default useRootFolders;

export const useSortedRootFolders = () => {
  const { data } = useRootFolders();

  // Copy before sorting -- the query cache hands the same array to every
  // consumer, where the slice's selector sorted a fresh copy per fetch.
  return useMemo(() => [...data].sort(sortByProp('path')), [data]);
};

export const useRootFolder = (id: number) => {
  return useApiQuery<RootFolder>({
    path: `/rootFolder/${id}`,
  });
};

const upsertRootFolder = (
  rootFolders: RootFolder[] = [],
  rootFolder: RootFolder
) =>
  rootFolders.some((r) => r.id === rootFolder.id)
    ? rootFolders.map((r) => (r.id === rootFolder.id ? rootFolder : r))
    : [...rootFolders, rootFolder];

export const useAddRootFolder = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, data } = useApiMutation<
    RootFolder,
    Pick<RootFolder, 'path'>
  >({
    path: '/rootFolder',
    method: 'POST',
    mutationOptions: {
      onSuccess: (rootFolder) => {
        queryClient.setQueryData<RootFolder[]>(
          ROOT_FOLDERS_QUERY_KEY,
          (rootFolders) => upsertRootFolder(rootFolders, rootFolder)
        );
      },
    },
  });

  return {
    addRootFolder: mutate,
    isAddingRootFolder: isPending,
    addRootFolderError: error,
    newRootFolder: data,
  };
};

export const useDeleteRootFolder = (id: number) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<void, void>({
    path: `/rootFolder/${id}`,
    method: 'DELETE',
    mutationOptions: {
      // The server broadcasts a rootfolder message on create but not on
      // delete, so dropping it here is what removes the row -- same as the
      // slice's remove handler did.
      onSuccess: () => {
        queryClient.setQueryData<RootFolder[]>(
          ROOT_FOLDERS_QUERY_KEY,
          (rootFolders) => rootFolders?.filter((r) => r.id !== id)
        );
      },
    },
  });

  return {
    deleteRootFolder: mutate,
    isDeletingRootFolder: isPending,
    deleteRootFolderError: error,
  };
};

// Rescans one folder for importable files. The id varies per call site -- the
// import pages refresh every folder they list -- so it rides in the payload
// rather than being bound when the hook is called.
export const useRefreshRootFolder = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    RootFolder,
    { id: number }
  >({
    path: ({ id }) => `/rootFolder/refresh/${id}`,
    method: 'POST',
    mutationOptions: {
      onSuccess: (rootFolder) => {
        queryClient.setQueryData<RootFolder[]>(
          ROOT_FOLDERS_QUERY_KEY,
          (rootFolders) => upsertRootFolder(rootFolders, rootFolder)
        );

        queryClient.setQueryData<RootFolder>(
          [`/rootFolder/${rootFolder.id}`],
          rootFolder
        );
      },
    },
  });

  return {
    refreshRootFolder: mutate,
    isRefreshingRootFolder: isPending,
    refreshRootFolderError: error,
  };
};
