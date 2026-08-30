import { CustomFilter, Filter, PropertyFilter } from 'Filters/Filter';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { MOVIE_INDEX_FILTERS } from 'Movie/Index/movieIndexFilters';
import Movie from 'Movie/Movie';
import { PagingResource } from 'Movie/Movie.types';
import { useSceneIndexOption } from './sceneIndexOptionsStore';

export interface SceneIndexQueryParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
}

export function useSceneIndexQuery(params: SceneIndexQueryParams) {
  const selectedFilterKey = useSceneIndexOption('selectedFilterKey');

  const customFilters = useCustomFiltersList('sceneIndex');

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
      // Always filter for scenes only
      { key: 'itemType', type: 'equal', value: 'scene' },
      ...filters,
    ],
  };

  return useApiQuery<PagingResource<Movie>>({
    path: '/movie/paged',
    method: 'POST',
    body: queryBody,
  });
}
