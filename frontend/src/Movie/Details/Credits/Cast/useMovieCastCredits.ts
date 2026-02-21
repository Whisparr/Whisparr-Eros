import { useQuery } from '@tanstack/react-query';
import MovieCredit from 'typings/MovieCredit';
import fetchJson from 'Utilities/Fetch/fetchJson';

const HEADERS = {
  'X-Api-Key': window.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};

export function useMovieCastCredits(movieId: string | number | undefined) {
  const PATH = `/credit?movieId=${movieId}`;
  return useQuery<MovieCredit[]>({
    queryKey: [PATH],
    queryFn: async () => {
      if (!movieId) return [];
      return fetchJson<MovieCredit[], undefined>({
        path: `/api/v3${PATH}`,
        method: 'GET',
        headers: HEADERS,
      });
    },
    enabled: !!movieId,
  });
}
