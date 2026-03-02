import { useDispatch } from 'react-redux';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import { refreshRootFolder } from 'Store/Actions/rootFolderActions';
import { ImportItem, MovieLookupResult } from './ImportMovieTypes';

interface ImportMovieBody extends MovieLookupResult {
  path: string;
  monitored: boolean;
  qualityProfileId: number;
  addOptions: {
    monitored: boolean;
    searchForMovie: boolean;
  };
}

function buildImportBody(items: ImportItem[]): ImportMovieBody[] {
  const seen = new Set<string>();

  return items.reduce<ImportMovieBody[]>((result, item) => {
    const movie = item.selectedMovie;
    if (!movie || seen.has(movie.foreignId)) {
      return result;
    }
    seen.add(movie.foreignId);

    const monitored = item.monitor === 'movieOnly';
    result.push({
      ...movie,
      path: item.path,
      monitored,
      qualityProfileId: item.qualityProfileId,
      addOptions: {
        monitored,
        searchForMovie: false,
      },
    });
    return result;
  }, []);
}

function useImportMutation(rootFolderId: number) {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useApiMutation<unknown, ImportMovieBody[]>({
    method: 'POST',
    path: '/movie/import',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/movie/paged'] });
        queryClient.invalidateQueries({ queryKey: ['/movie/stats'] });
        dispatch(refreshRootFolder({ id: rootFolderId }));
      },
    },
  });
}

export { buildImportBody };
export default useImportMutation;
