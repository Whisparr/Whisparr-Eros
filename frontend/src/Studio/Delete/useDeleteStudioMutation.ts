import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';

interface DeleteStudioPayload {
  id: number;
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

// There is no bulk delete endpoint for studios -- `/studio/editor` is PUT only --
// so the index's multi-select modal fires one of these per id, exactly as the
// thunk it replaces did.
export function useDeleteStudioMutation() {
  return useApiMutation<unknown, DeleteStudioPayload>({
    method: 'DELETE',
    path: ({ id, deleteFiles, addImportExclusion }) =>
      `/studio/${id}?deleteFiles=${deleteFiles}&addImportExclusion=${addImportExclusion}`,
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/studio/paged'] });
      },
    },
  });
}
