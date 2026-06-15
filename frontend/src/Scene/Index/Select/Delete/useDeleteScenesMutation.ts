import { useNavigate } from 'react-router-dom';
import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';

interface DeleteScenesPayload {
  movieIds: number[];
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

export function useDeleteScenesMutation() {
  const navigate = useNavigate();

  const mutation = useApiMutation<unknown, DeleteScenesPayload>({
    method: 'DELETE',
    path: '/movie/editor',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['/movie/paged'],
        });

        navigate('/scenes');
      },
    },
  });

  return mutation;
}
