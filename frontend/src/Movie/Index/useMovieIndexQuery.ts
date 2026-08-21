import { CustomFilter, Filter, PropertyFilter } from 'App/State/AppState';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { MOVIE_INDEX_FILTERS } from 'Movie/Index/movieIndexFilters';
import Movie from 'Movie/Movie';
import { PagingResource } from 'Movie/Movie.types';
import { useMovieIndexOption } from './movieIndexOptionsStore';

export interface MovieIndexQueryParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
}

export function useMovieIndexQuery(params: MovieIndexQueryParams) {
  const selectedFilterKey = useMovieIndexOption('selectedFilterKey');

  const customFilters = useCustomFiltersList('movieIndex');

  let filterDef: Filter | CustomFilter | undefined = undefined;
  let filters: PropertyFilter[] = [];

  if (
    selectedFilterKey !== undefined &&
    selectedFilterKey !== null &&
    !Number.isNaN(Number(selectedFilterKey))
  ) {
    // Numeric ID indicates a custom filter
    filterDef = customFilters.find(
      (f: CustomFilter) => String(f.id) === String(selectedFilterKey)
    );
    filters = filterDef && filterDef.filters ? filterDef.filters : [];
  } else {
    // String key indicates a predefined filter
    filterDef = MOVIE_INDEX_FILTERS.find((f) => f.key === selectedFilterKey);
    filters = filterDef && filterDef.filters ? filterDef.filters : [];
  }

  const queryBody = {
    ...params,
    filters: [
      // Always filter for movies only
      { key: 'itemType', type: 'equal', value: 'movie' },
      ...filters,
    ],
  };

  return useApiQuery<PagingResource<Movie>>({
    path: '/movie/paged',
    method: 'POST',
    body: queryBody,
  });
}
