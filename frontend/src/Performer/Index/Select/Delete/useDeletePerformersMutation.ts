import { useNavigate } from 'react-router-dom';
import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';

interface DeletePerformersPayload {
  performerIds: number[];
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

export function useDeletePerformersMutation() {
  const navigate = useNavigate();

  const mutation = useApiMutation<unknown, DeletePerformersPayload>({
    method: 'DELETE',
    path: '/performer/editor',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['/performer/paged'],
        });

        navigate('/performers');
      },
    },
  });

  return mutation;
}
