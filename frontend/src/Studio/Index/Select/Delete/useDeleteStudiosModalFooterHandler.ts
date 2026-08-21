import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteStudioMutation } from 'Studio/Delete/useDeleteStudioMutation';

interface UseDeleteStudiosModalFooterHandlerProps {
  studioIds: number[];
  onModalClose: () => void;
}

export function useDeleteStudiosModalFooterHandler({
  studioIds,
  onModalClose,
}: UseDeleteStudiosModalFooterHandlerProps) {
  const deleteMutation = useDeleteStudioMutation();
  const navigate = useNavigate();

  const handleDelete = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      onModalClose(); // Close modal immediately when delete is confirmed

      // No bulk endpoint exists for studios, so this fires one request per id,
      // exactly as the thunk loop it replaces did.
      studioIds.forEach((id) => {
        deleteMutation.mutate({ id, deleteFiles, addImportExclusion });
      });

      navigate('/studios');
    },
    [studioIds, onModalClose, deleteMutation, navigate]
  );

  return {
    onDeletePress: handleDelete,
    isPending: deleteMutation.isPending,
  };
}
