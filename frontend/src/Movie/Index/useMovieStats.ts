import useApiQuery from 'Helpers/Hooks/useApiQuery';

export interface MovieStats {
  totalCount: number;
  monitoredCount: number;
  movieFiles: number;
  totalFileSize: number;
}

export function useMovieStats() {
  return useApiQuery<MovieStats>({
    path: '/movie/stats',
    queryParams: { itemType: 'movie' },
  });
}
