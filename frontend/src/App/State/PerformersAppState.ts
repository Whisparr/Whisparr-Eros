import Column from 'Components/Table/Column';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Performer from 'Performer/Performer';
import AppSectionState, { AppSectionSaveState } from './AppSectionState';
import { Filter, FilterBuilderProp } from './AppState';

interface PerformersAppState
  extends AppSectionSaveState, AppSectionState<Performer> {
  sortKey: string;
  page: number;
  pageSize: number;
  sortDirection: SortDirection;
  secondarySortKey: string;
  secondarySortDirection: SortDirection;
  view: string;

  posterOptions: {
    detailedProgressBar: boolean;
    pageSize: number;
    size: string;
    showName: boolean;
  };

  deleteOptions: {
    addImportExclusion: boolean;
  };

  tableOptions: {
    pageSize: number;
    showSearchAction: boolean;
  };

  selectedFilterKey: string;
  filterBuilderProps: FilterBuilderProp<Performer>[];
  filters: Filter[];
  columns: Column[];
  pendingChanges: Partial<Performer>;
}

export default PerformersAppState;
