import { useMemo } from 'react';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Movie from 'Movie/Movie';

// The names (and aliases) of the visible performers credited on these movies,
// keyed by foreign id. Scene lists only carry performer names, so this is how
// they tell a hidden co-star from a performer the user follows.
export default function useVisiblePerformerNames(
  movies: ReadonlyArray<Movie>,
  enabled = true
) {
  const foreignIds = useMemo(
    () =>
      Array.from(
        new Set(movies.flatMap((movie) => movie.performerForeignIds ?? []))
      ).sort((a, b) => a.localeCompare(b)),
    [movies]
  );

  return useApiQuery<Record<string, string[]>>({
    path: '/performer/visible',
    method: 'POST',
    body: foreignIds,
    queryOptions: { enabled: enabled && foreignIds.length > 0 },
  });
}
