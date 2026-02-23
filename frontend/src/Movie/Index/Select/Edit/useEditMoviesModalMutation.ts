import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import Movie from 'Movie/Movie';

interface MovieEditorPayload {
  movieIds: number[];
  monitored?: boolean;
  moviesMonitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
  tags?: number[];
  applyTags?: 'add' | 'remove' | 'replace';
}

export function useEditMoviesModalMutation() {
  const mutation = useApiMutation<Movie[], MovieEditorPayload>({
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
