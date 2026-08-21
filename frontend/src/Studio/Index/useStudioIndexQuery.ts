import { CustomFilter, Filter, PropertyFilter } from 'App/State/AppState';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Studio from 'Studio/Studio';
import { STUDIO_INDEX_FILTERS } from './studioIndexFilters';
import { useStudioIndexOption } from './studioIndexOptionsStore';

/**
 * Filter configuration for studio queries
 */
export interface StudioFilter {
  key: string;
  operator: string;
  value: string | number | boolean;
}

/**
 * Parameters for querying paginated studio data. Filters are not among them:
 * this hook resolves the selected filter itself and appends it, so the caller's
 * `filters` was overwritten on every call.
 */
export interface StudioIndexQueryParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
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
  const selectedFilterKey = useStudioIndexOption('selectedFilterKey');

  const customFilters = useCustomFiltersList('studios');

  let filterDef: Filter | CustomFilter | undefined = undefined;
  let filters: PropertyFilter[] = [];

  // Resolve filter definition: custom filters (numeric IDs) or predefined filters (string keys)
  if (
    selectedFilterKey !== undefined &&
    selectedFilterKey !== null &&
    !Number.isNaN(Number(selectedFilterKey))
  ) {
    // Numeric ID indicates a custom filter
    filterDef = customFilters.find(
      (f: CustomFilter) => String(f.id) === String(selectedFilterKey)
    );
    filters = filterDef?.filters ?? [];
  } else {
    // String key indicates a predefined filter
    filterDef = STUDIO_INDEX_FILTERS.find(
      (f: Filter) => f.key === selectedFilterKey
    );
    filters = filterDef?.filters ?? [];
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
