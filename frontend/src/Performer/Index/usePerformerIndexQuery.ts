import { useSelector } from 'react-redux';
import AppState, {
  CustomFilter,
  Filter,
  PropertyFilter,
} from 'App/State/AppState';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { PagingResource } from 'Movie/Movie.types';
import Performer from 'Performer/Performer';
import { filters as performerFilters } from 'Store/Actions/performerActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';

export interface PerformerIndexQueryParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
}

export function usePerformerIndexQuery(params: PerformerIndexQueryParams) {
  const selectedFilterKey = useSelector(
    (state: AppState) => state.performers.selectedFilterKey
  );

  const customFilters = useSelector(createCustomFiltersSelector('performers'));

  let filterDef: Filter | undefined = undefined;
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
    filterDef = performerFilters.find((f) => f.key === selectedFilterKey);
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
