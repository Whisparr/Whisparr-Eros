import { useMutation, useQueryClient } from '@tanstack/react-query';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Backup from 'typings/Backup';
import getQueryPath from 'Utilities/Fetch/getQueryPath';

const useBackups = () => {
  const result = useApiQuery<Backup[]>({
    path: '/system/backup',
    queryOptions: {
      staleTime: 30 * 1000, // 30 seconds
    },
  });

  return {
    ...result,
    data: result.data ?? [],
  };
};

export default useBackups;

export const useDeleteBackup = (id: number) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<object, void>({
    path: `/system/backup/${id}`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/system/backup'] });
      },
    },
  });

  return {
    deleteBackup: mutate,
    isDeleting: isPending,
    deleteError: error,
  };
};

interface RestoreBackupResponse {
  restartRequired: boolean;
}

export const useRestoreBackup = (id: number) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    RestoreBackupResponse,
    void
  >({
    path: `/system/backup/restore/${id}`,
    method: 'POST',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/system/backup'] });
      },
    },
  });

  return {
    restoreBackupById: mutate,
    isRestoringBackup: isPending,
    restoreBackupError: error,
  };
};

// Multipart upload, so this cannot go through useApiMutation -- fetchJson sets
// a JSON content type, and the boundary has to be left to the browser.
export const useRestoreBackupUpload = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation<
    RestoreBackupResponse,
    Error,
    FormData
  >({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(
        getQueryPath('/system/backup/restore/upload'),
        {
          method: 'POST',
          headers: {
            'X-Api-Key': window.Whisparr.apiKey,
            'X-Whisparr-Client': 'Whisparr',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to restore backup: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/system/backup'] });
    },
  });

  return {
    uploadBackup: mutate,
    isUploadingBackup: isPending,
    uploadBackupError: error,
  };
};
