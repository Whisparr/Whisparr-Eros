import { useQueryClient } from '@tanstack/react-query';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
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

// Used when an interactive import matches a file that is already in the library:
// the file stays where it is and only its metadata is rewritten, so there is
// nothing to import.
export function useUpdateMovieFiles() {
  const queryClient = useQueryClient();
  return useApiMutation<MovieFile[], Partial<MovieFile>[]>({
    path: `${PATH}/bulk`,
    method: 'PUT',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [PATH] });
      },
    },
  });
}

export function useDeleteMovieFiles() {
  const queryClient = useQueryClient();
  return useApiMutation<void, { movieFileIds: number[] }>({
    path: `${PATH}/bulk`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [PATH] });
      },
    },
  });
}

export default useMovieFile;
