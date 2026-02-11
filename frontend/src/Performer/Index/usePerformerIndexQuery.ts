import { useSelector } from 'react-redux';
import AppState, { Filter, PropertyFilter } from 'App/State/AppState';
import { CustomFilter } from 'Filters/Filter';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Performer from 'Performer/Performer';
import { filters as performerFilters } from 'Store/Actions/performerActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';

/**
 * Filter configuration for performer queries
 */
export interface PerformerFilter {
  key: string;
  operator: string;
  value: string | number | boolean;
}

/**
 * Parameters for querying paginated performer data
 */
export interface PerformerIndexQueryParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
  filters: PerformerFilter[];
}

/**
 * Extended performer record with calculated and related data
 */
export interface PerformerIndexRecord extends Performer {
  hasMovies: boolean;
  hasScenes: boolean;
  movieCount: number;
  totalMovieCount: number;
  totalSceneCount: number;
  sceneCount: number;
  sizeOnDisk: number;
}

/**
 * Response from the paginated performer index API endpoint
 */
export interface PerformerIndexPagedResponse {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
  totalRecords: number;
  records: Performer[];
  filters: PerformerFilter[];
  customFilters: PerformerFilter[];
}

/**
 * Custom hook for fetching paginated performer data from the API.
 *
 * Handles filter resolution by checking if the selected filter is a custom filter
 * (numeric ID) or a predefined filter (string key), then merges the appropriate
 * filter configuration into the query parameters.
 *
 * @param params - Query parameters (page, pageSize, sort, etc.)
 * @param options - React Query options (e.g., placeholderData)
 * @returns Query result with performer data and loading state
 */
export function usePerformerIndexQuery(
  params: PerformerIndexQueryParams,
  options: {
    placeholderData: (
      prev: PerformerIndexPagedResponse
    ) => PerformerIndexPagedResponse;
  }
) {
  // Retrieve selected filter key from Redux store
  const selectedFilterKey = useSelector(
    (state: AppState) => state.performers.selectedFilterKey
  );

  // Get custom filters from Redux store
  const customFilters = useSelector(createCustomFiltersSelector('performers'));

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
    filterDef = performerFilters.find((f) => f.key === selectedFilterKey);
    filters = filterDef && filterDef.filters ? filterDef.filters : [];
  }

  // Combine query parameters with resolved filters
  const queryParams = {
    ...params,
    filters,
  };

  // Execute API query for paginated performer data
  return useApiQuery<PerformerIndexPagedResponse>({
    path: '/performer/paged',
    method: 'POST',
    body: queryParams,
    ...options,
  });
}
