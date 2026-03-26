import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryClient } from 'App/queryClient';

interface DeleteMovieOptions {
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

interface DeleteMoviesPayload {
  movieIds: number[];
  options: DeleteMovieOptions;
}

export function useDeleteMoviesMutation() {
  const navigate = useNavigate();

  // TODO: Move to useApiMutation
  const mutation = useMutation<void, Error, DeleteMoviesPayload>({
    mutationFn: async ({ movieIds, options }: DeleteMoviesPayload) => {
      // Delete movies sequentially
      for (const id of movieIds) {
        const queryParams = new URLSearchParams({
          deleteFiles: String(options.deleteFiles),
          addImportExclusion: String(options.addImportExclusion),
        });

        const response = await fetch(
          `/api/v3/movie/${id}?${queryParams.toString()}`,
          {
            method: 'DELETE',
            headers: {
              'X-Api-Key': window.Whisparr.apiKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete item ${id}`);
        }
      }
    },
    onSuccess: () => {
      // Invalidate all movie paged queries
      queryClient.invalidateQueries({
        queryKey: ['/movie/paged'],
      });

      // Navigate back to movies list
      navigate('/movies');
    },
  });

  return mutation;
}
