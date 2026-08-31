import { useQueryClient } from '@tanstack/react-query';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Backup from 'typings/Backup';

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

// Multipart upload -- `fetchJson` passes FormData through untouched, so the
// browser keeps setting the boundary and this goes through the shared layer.
export const useRestoreBackupUpload = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    RestoreBackupResponse,
    FormData
  >({
    method: 'POST',
    path: '/system/backup/restore/upload',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/system/backup'] });
      },
    },
  });

  return {
    uploadBackup: mutate,
    isUploadingBackup: isPending,
    uploadBackupError: error,
  };
};
