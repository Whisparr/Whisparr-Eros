import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';

interface DeletePerformerPayload {
  id: number;
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

export function useDeletePerformerMutation() {
  return useApiMutation<unknown, DeletePerformerPayload>({
    method: 'DELETE',
    path: ({ id, deleteFiles, addImportExclusion }) =>
      `/performer/${id}?deleteFiles=${deleteFiles}&addImportExclusion=${addImportExclusion}`,
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/performer/paged'] });
      },
    },
  });
}
