import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';
import { SortDirection } from 'Helpers/Props/sortDirections';

export interface ImportListExclusionOptions {
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
}

// The redux section persisted only `pageSize` and left sorting unset, so the
// server picked it: `/exclusions/paged` defaults to id descending. Those are
// the defaults here, which keeps the first page identical to before.
const { useOptions, setOption, setSort } =
  createOptionsStore<ImportListExclusionOptions>(
    'import_list_exclusion_options',
    () => {
      return {
        pageSize: 20,
        sortKey: 'id',
        sortDirection: 'descending',
      };
    }
  );

export const useImportListExclusionOptions = useOptions;
export const setImportListExclusionOption = setOption;
export const setImportListExclusionSort = setSort;
