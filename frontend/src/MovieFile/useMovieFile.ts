import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { UnmappedFile } from '../UnmappedFiles/UnmappedFilesTable';
import { MovieFile } from './MovieFile';

const PATH = '/moviefile';

// Fetch all movie files for a movieId
function useMovieFile(movieId: number | undefined) {
  return useApiQuery<MovieFile[] | undefined>({
    path: PATH,
    queryParams: { movieId },
    queryOptions: { enabled: !!movieId },
  });
}

// Fetch all unmapped movie files
export function useUnmappedMovieFiles() {
  return useApiQuery<UnmappedFile[] | undefined>({
    path: PATH,
    queryOptions: { enabled: true },
    queryParams: { unmapped: true },
  });
}

// Fetch a single movie file by movieFileId
export function useSingleMovieFile(movieFileId: number | undefined) {
  return useApiQuery<MovieFile | undefined>({
    path: `${PATH}/${movieFileId}`,
    queryOptions: { enabled: !!movieFileId },
  });
}

// Fetch multiple movie files by an array of movieFileIds
export function useMovieFilesByIds(movieFileIds: number[] | undefined) {
  const idsParam = movieFileIds?.join(',');
  return useApiQuery<MovieFile[] | undefined>({
    path: `${PATH}/list`,
    queryOptions: { enabled: !!movieFileIds && movieFileIds.length > 0 },
    queryParams: { ids: idsParam },
  });
}

export default useMovieFile;
