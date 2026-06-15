import { useCallback } from 'react';
import { useDeleteScenesMutation } from './useDeleteScenesMutation';

interface UseDeleteSceneModalFooterHandlerProps {
  sceneIds: number[];
  onModalClose: () => void;
}

export function useDeleteSceneModalFooterHandler({
  sceneIds,
  onModalClose,
}: UseDeleteSceneModalFooterHandlerProps) {
  const deleteMutation = useDeleteScenesMutation();

  // Returns a function that takes delete options and performs the deletion
  const handleDelete = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      onModalClose(); // Close modal immediately when delete is confirmed
      deleteMutation.mutate({
        movieIds: sceneIds,
        deleteFiles,
        addImportExclusion,
      });
    },
    [sceneIds, onModalClose, deleteMutation]
  );

  return {
    onDeletePress: handleDelete,
    isPending: deleteMutation.isPending,
  };
}
