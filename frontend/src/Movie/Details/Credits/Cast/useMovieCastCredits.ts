import useApiQuery from 'Helpers/Hooks/useApiQuery';
import MovieCredit from 'typings/MovieCredit';

export function useMovieCastCredits(movieId: string | number | undefined) {
  return useApiQuery<MovieCredit[]>({
    path: '/credit',
    queryOptions: { enabled: !!movieId },
    queryParams: { movieId },
  });
}
