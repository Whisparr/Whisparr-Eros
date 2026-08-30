import React, { useMemo } from 'react';
import { useAllMovies } from 'Movie/useMovie';
import sortByProp from 'Utilities/Array/sortByProp';
import FilterBuilderRowValue from './FilterBuilderRowValue';
import FilterBuilderRowValueProps from './FilterBuilderRowValueProps';

// The value picker for the `movieIds` filter on History, Blocklist and Queue.
// It read the `movies` slice, which nothing has populated since the indexes went
// paged, so the list was always empty and no movie filter could be built. The
// whole library is fetched because the filter is over the whole library; the
// request only goes out once a filter row picks the Movie field.
function MovieFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  const { movies } = useAllMovies();

  const tagList = useMemo(
    () =>
      movies
        .map((movie) => ({ id: movie.id, name: movie.title }))
        .sort(sortByProp('name')),
    [movies]
  );

  return <FilterBuilderRowValue {...props} tagList={tagList} />;
}

export default MovieFilterBuilderRowValue;
