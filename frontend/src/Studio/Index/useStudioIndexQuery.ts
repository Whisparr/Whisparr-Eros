import { useSelector } from 'react-redux';
import AppState, { Filter, PropertyFilter } from 'App/State/AppState';
import { CustomFilter } from 'Filters/Filter';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { filters as studioFilters } from 'Store/Actions/studioActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';
import Studio from 'Studio/Studio';

/**
 * Filter configuration for studio queries
 */
export interface StudioFilter {
  key: string;
  operator: string;
  value: string | number | boolean;
}

/**
 * Parameters for querying paginated studio data
 */
export interface StudioIndexQueryParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
  filters: StudioFilter[];
}

/**
 * Extended studio record with calculated and related data
 */
export interface StudioIndexRecord extends Studio {
  hasMovies: boolean;
  hasScenes: boolean;
  movieCount: number;
  totalMovieCount: number;
  totalSceneCount: number;
  sceneCount: number;
  sizeOnDisk: number;
}

/**
 * Response from the paginated studio index API endpoint
 */
export interface StudioIndexPagedResponse {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
  totalRecords: number;
  records: Studio[];
  filters: StudioFilter[];
  customFilters: StudioFilter[];
}

/**
 * Custom hook for fetching paginated studio data from the API.
 *
 * Handles filter resolution by checking if the selected filter is a custom filter
 * (numeric ID) or a predefined filter (string key), then merges the appropriate
 * filter configuration into the query parameters.
 *
 * @param params - Query parameters (page, pageSize, sort, etc.)
 * @param options - React Query options (e.g., placeholderData)
 * @returns Query result with studio data and loading state
 */
export function useStudioIndexQuery(
  params: StudioIndexQueryParams,
  options: {
    placeholderData: (
      prev: StudioIndexPagedResponse
    ) => StudioIndexPagedResponse;
  }
) {
  // Retrieve selected filter key from Redux store
  const selectedFilterKey = useSelector(
    (state: AppState) => state.studios.selectedFilterKey
  );

  // Get custom filters from Redux store
  const customFilters = useSelector(createCustomFiltersSelector('studios'));

  let filterDef: Filter | undefined = undefined;
  let filters: PropertyFilter[] = [];

  // Resolve filter definition: custom filters (numeric IDs) or predefined filters (string keys)
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
    filterDef = studioFilters.find((f: Filter) => f.key === selectedFilterKey);
    filters = filterDef && filterDef.filters ? filterDef.filters : [];
  }

  // Combine query parameters with resolved filters
  const queryParams = {
    ...params,
    filters,
  };

  // Execute API query for paginated studio data
  return useApiQuery<StudioIndexPagedResponse>({
    path: '/studio/paged',
    method: 'POST',
    body: queryParams,
    ...options,
  });
}
