import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import Movie from 'Movie/Movie';

interface SceneEditorPayload {
  movieIds: number[];
  monitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
  tags?: number[];
  applyTags?: 'add' | 'remove' | 'replace';
}

export function useEditScenesModalMutation() {
  const mutation = useApiMutation<Movie[], SceneEditorPayload>({
    method: 'PUT',
    path: '/movie/editor',
    mutationOptions: {
      onSuccess: () => {
        // Invalidate all movie paged queries regardless of paging/sorting/filter params
        queryClient.invalidateQueries({
          queryKey: ['/movie/paged'],
        });
      },
    },
  });

  return mutation;
}
