import { useSelector } from 'react-redux';
import AppState, {
  CustomFilter,
  Filter,
  PropertyFilter,
} from 'App/State/AppState';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import { PagingResource } from 'Movie/Movie.types';
import { filters as movieIndexFilters } from 'Store/Actions/movieActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';

export interface SceneIndexQueryParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
}

export function useSceneIndexQuery(params: SceneIndexQueryParams) {
  const selectedFilterKey = useSelector(
    (state: AppState) => state.sceneIndex.selectedFilterKey
  );

  const customFilters = useSelector(createCustomFiltersSelector('sceneIndex'));

  let filterDef: Filter | undefined = undefined;
  let filters: PropertyFilter[] = [];

  if (
    selectedFilterKey !== undefined &&
    selectedFilterKey !== null &&
    !isNaN(Number(selectedFilterKey))
  ) {
    // Numeric ID indicates a custom filter
    filterDef = customFilters.find(
      (f: CustomFilter) => String(f.id) === String(selectedFilterKey)
    );
    filters = filterDef && filterDef.filters ? filterDef.filters : [];
  } else {
    // String key indicates a predefined filter
    filterDef = movieIndexFilters.find((f) => f.key === selectedFilterKey);
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
