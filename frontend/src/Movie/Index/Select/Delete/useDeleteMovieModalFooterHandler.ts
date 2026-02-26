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
  const { mutate, isPending } = useDeleteMoviesMutation();

  const handleDelete = useCallback(
    (deleteFiles: boolean, addImportExclusion: boolean) => {
      onModalClose();
      mutate({
        movieIds,
        options: { deleteFiles, addImportExclusion },
      });
    },
    [movieIds, onModalClose, mutate]
  );

  return {
    onDeletePress: handleDelete,
    isPending,
  };
}
