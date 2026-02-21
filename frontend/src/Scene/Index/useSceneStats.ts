import useApiQuery from 'Helpers/Hooks/useApiQuery';

export interface MovieStats {
  totalCount: number;
  monitoredCount: number;
  movieFiles: number;
  totalFileSize: number;
}

export function useSceneStats() {
  return useApiQuery<MovieStats>({
    path: '/movie/stats',
    queryParams: { itemType: 'scene' },
  });
}
