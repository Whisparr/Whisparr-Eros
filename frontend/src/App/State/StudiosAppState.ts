import Column from 'Components/Table/Column';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Studio from 'Studio/Studio';
import AppSectionState, { AppSectionSaveState } from './AppSectionState';
import { Filter, FilterBuilderProp } from './AppState';

interface StudiosAppState extends AppSectionSaveState, AppSectionState<Studio> {
  sortKey: string;
  sortDirection: SortDirection;
  secondarySortKey: string;
  secondarySortDirection: SortDirection;
  view: string;
  page: number;
  selectedFilterKey: string;

  deleteOptions: {
    addImportExclusion: boolean;
  };

  posterOptions: {
    detailedProgressBar: boolean;
    size: string;
    showTitle: boolean;
    pageSize: number;
  };

  tableOptions: {
    pageSize: number;
  };

  filterBuilderProps: FilterBuilderProp<Studio>[];
  filters: Filter[];
  columns: Column[];
  pendingChanges: Partial<Studio>;
}

export default StudiosAppState;
