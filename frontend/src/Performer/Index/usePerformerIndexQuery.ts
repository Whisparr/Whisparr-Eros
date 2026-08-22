import { CustomFilter, Filter, PropertyFilter } from 'App/State/AppState';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { PagingResource } from 'Movie/Movie.types';
import Performer from 'Performer/Performer';
import { PERFORMER_INDEX_FILTERS } from './performerIndexFilters';
import { usePerformerIndexOption } from './performerIndexOptionsStore';

// Only the paging and sort parameters are passed in. Filters are not among
// them: this hook resolves the selected filter itself and appends it.
export interface PerformerIndexQueryParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
}

export function usePerformerIndexQuery(params: PerformerIndexQueryParams) {
  const selectedFilterKey = usePerformerIndexOption('selectedFilterKey');

  const customFilters = useCustomFiltersList('performers');

  let filterDef: Filter | CustomFilter | undefined = undefined;
  let filters: PropertyFilter[] = [];

  if (
    selectedFilterKey !== undefined &&
    selectedFilterKey !== null &&
    !Number.isNaN(Number(selectedFilterKey))
  ) {
    filterDef = customFilters.find(
      (f: CustomFilter) => String(f.id) === String(selectedFilterKey)
    );
    filters = filterDef?.filters ?? [];
  } else {
    filterDef = PERFORMER_INDEX_FILTERS.find(
      (f) => f.key === selectedFilterKey
    );
    filters = filterDef?.filters ?? [];
  }

  const queryBody = {
    ...params,
    filters,
  };

  return useApiQuery<PagingResource<Performer>>({
    path: '/performer/paged',
    method: 'POST',
    body: queryBody,
  });
}
