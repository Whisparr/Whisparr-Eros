import { useCallback } from 'react';
import { useDeleteMoviesMutation } from './useDeleteMoviesMutation';

interface UseDeleteMovieModalFooterHandlerProps {
  movieIds: number[];
  onModalClose: () => void;
}

export function useDeleteMovieModalFooterHandler({
  movieIds,
  onModalClose,
}: UseDeleteMovieModalFooterHandlerProps) {
  const deleteMutation = useDeleteMoviesMutation();

  // Returns a function that takes delete options and performs the deletion
  const handleDelete = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      onModalClose(); // Close modal immediately when delete is confirmed
      deleteMutation.mutate({
        movieIds,
        options: { deleteFiles, addImportExclusion },
      });
    },
    [movieIds, onModalClose, deleteMutation]
  );

  return {
    onDeletePress: handleDelete,
    isPending: deleteMutation.isPending,
  };
}
