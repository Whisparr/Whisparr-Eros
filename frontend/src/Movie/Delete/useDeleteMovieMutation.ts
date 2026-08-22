import { queryClient } from 'App/queryClient';
import { COLLECTION_PATH } from 'Collection/useMovieCollections';
import useApiMutation from 'Helpers/Hooks/useApiMutation';

interface DeleteMoviePayload {
  id: number;
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

export function useDeleteMovieMutation() {
  return useApiMutation<unknown, DeleteMoviePayload>({
    method: 'DELETE',
    path: ({ id, deleteFiles, addImportExclusion }) =>
      `/movie/${id}?deleteFiles=${deleteFiles}&addImportExclusion=${addImportExclusion}`,
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/movie/paged'] });

        // The collections a deleted movie belonged to now show one more missing
        // movie. This used to be patched into the store by hand, guessing the
        // new count, and only worked at all once the collections page had been
        // visited; the server recomputes it.
        queryClient.invalidateQueries({ queryKey: [COLLECTION_PATH] });
      },
    },
  });
}
