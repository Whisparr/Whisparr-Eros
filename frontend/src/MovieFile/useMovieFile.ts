import { useQuery } from '@tanstack/react-query';
import { UnmappedFile } from '../UnmappedFiles/UnmappedFilesTable';
import fetchJson from '../Utilities/Fetch/fetchJson';
import { MovieFile } from './MovieFile';

const AUTH_HEADERS = {
  'X-Api-Key': window.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};

function apiGet<T>(path: string) {
  return fetchJson<T, undefined>({
    path: `/api/v3${path}`,
    method: 'GET',
    headers: AUTH_HEADERS,
  });
}

// Fetch all movie files for a movieId
function useMovieFile(movieId: number | undefined) {
  const PATH = `/moviefile?movieId=${movieId}`;
  return useQuery<MovieFile[] | undefined>({
    queryKey: [PATH],
    queryFn: async () => {
      if (!movieId) return undefined;
      return apiGet<MovieFile[]>(PATH);
    },
    enabled: !!movieId,
  });
}

// Fetch all unmapped movie files
export function useUnmappedMovieFiles() {
  const PATH = `/moviefile?unmapped=true`;
  return useQuery<UnmappedFile[] | undefined>({
    queryKey: [PATH],
    queryFn: async () => {
      return apiGet<UnmappedFile[]>(PATH);
    },
    enabled: true,
  });
}

// Fetch a single movie file by movieFileId
export function useSingleMovieFile(movieFileId: number | undefined) {
  const PATH = `/moviefile/${movieFileId}`;
  return useQuery<MovieFile | undefined>({
    queryKey: [PATH],
    queryFn: async () => {
      if (!movieFileId) return undefined;
      return apiGet<MovieFile>(PATH);
    },
    enabled: !!movieFileId,
  });
}

// Fetch multiple movie files by an array of movieFileIds
export function useMovieFilesByIds(movieFileIds: number[] | undefined) {
  return useQuery<MovieFile[] | undefined>({
    queryKey: ['movieFilesByIds', movieFileIds],
    queryFn: async () => {
      if (!movieFileIds || movieFileIds.length === 0) return undefined;
      const idsParam = movieFileIds.join(',');
      return apiGet<MovieFile[]>(`/moviefile/list?ids=${idsParam}`);
    },
    enabled: !!movieFileIds && movieFileIds.length > 0,
  });
}

export default useMovieFile;
