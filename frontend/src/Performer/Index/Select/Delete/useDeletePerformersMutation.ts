import { useMutation } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import { queryClient } from 'App/queryClient';

interface DeletePerformerOptions {
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

interface DeletePerformersPayload {
  performerIds: number[];
  options: DeletePerformerOptions;
}

export function useDeletePerformersMutation() {
  const history = useHistory();

  const mutation = useMutation<void, Error, DeletePerformersPayload>({
    mutationFn: async ({ performerIds, options }: DeletePerformersPayload) => {
      // Delete performers sequentially
      for (const id of performerIds) {
        const queryParams = new URLSearchParams({
          deleteFiles: String(options.deleteFiles),
          addImportExclusion: String(options.addImportExclusion),
        });

        const response = await fetch(
          `/api/v3/performer/${id}?${queryParams.toString()}`,
          {
            method: 'DELETE',
            headers: {
              'X-Api-Key': window.Whisparr.apiKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete performer ${id}`);
        }
      }
    },
    onSuccess: () => {
      // Invalidate all performer paged queries
      queryClient.invalidateQueries({
        queryKey: ['/performer/paged'],
      });

      // Navigate back to performers list
      history.push('/performers');
    },
  });

  return mutation;
}
