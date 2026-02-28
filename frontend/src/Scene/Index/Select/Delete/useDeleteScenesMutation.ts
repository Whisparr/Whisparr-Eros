import { useMutation } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import { queryClient } from 'App/queryClient';

interface DeleteMovieOptions {
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

interface DeleteScenesPayload {
  sceneIds: number[];
  options: DeleteMovieOptions;
}

export function useDeleteScenesMutation() {
  const history = useHistory();

  // TODO: Move to useApiMutation
  const mutation = useMutation<void, Error, DeleteScenesPayload>({
    mutationFn: async ({ sceneIds, options }: DeleteScenesPayload) => {
      // Delete scenes sequentially
      for (const id of sceneIds) {
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

      // Navigate back to scenes list
      history.push('/scenes');
    },
  });

  return mutation;
}
