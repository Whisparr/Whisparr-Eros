import { useNavigate } from 'react-router-dom';
import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';

interface DeleteMoviesPayload {
  movieIds: number[];
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

export function useDeleteMoviesMutation() {
  const navigate = useNavigate();

  const mutation = useApiMutation<unknown, DeleteMoviesPayload>({
    method: 'DELETE',
    path: '/movie/editor',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['/movie/paged'],
        });

        navigate('/movies');
      },
    },
  });

  return mutation;
}
