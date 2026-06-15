import { useCallback } from 'react';
import { useDeletePerformersMutation } from './useDeletePerformersMutation';

interface UseDeletePerformerModalFooterHandlerProps {
  performerIds: number[];
  onModalClose: () => void;
}

export function useDeletePerformerModalFooterHandler({
  performerIds,
  onModalClose,
}: UseDeletePerformerModalFooterHandlerProps) {
  const deleteMutation = useDeletePerformersMutation();

  // Returns a function that takes delete options and performs the deletion
  const handleDelete = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      onModalClose(); // Close modal immediately when delete is confirmed
      deleteMutation.mutate({
        performerIds,
        deleteFiles,
        addImportExclusion,
      });
    },
    [performerIds, onModalClose, deleteMutation]
  );

  return {
    onDeletePress: handleDelete,
    isPending: deleteMutation.isPending,
  };
}
