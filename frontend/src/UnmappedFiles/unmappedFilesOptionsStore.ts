import Column from 'Components/Table/Column';
import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

export interface UnmappedFilesOptions {
  columns: Column[];
  sortKey: string;
  sortDirection: SortDirection;
}

const { useOptions, setOptions, setSort } =
  createOptionsStore<UnmappedFilesOptions>(
    'unmapped_files_options',
    (): UnmappedFilesOptions => {
      return {
        sortKey: 'path',
        sortDirection: 'ascending',
        columns: [
          {
            name: 'select',
            label: '',
            columnLabel: 'Select',
            isSortable: false,
            isVisible: true,
            isModifiable: 'disabled',
          },
          {
            name: 'path',
            label: () => translate('Path'),
            isSortable: true,
            isVisible: true,
          },
          {
            name: 'size',
            label: () => translate('Size'),
            isSortable: true,
            isVisible: true,
          },
          {
            name: 'dateAdded',
            label: () => translate('DateAdded'),
            isSortable: true,
            isVisible: true,
          },
          {
            name: 'quality',
            label: () => translate('Quality'),
            isSortable: true,
            isVisible: true,
          },
          {
            name: 'actions',
            label: '',
            columnLabel: () => translate('Actions'),
            isVisible: true,
            isModifiable: 'disabled',
          },
        ],
      };
    }
  );

export const useUnmappedFilesOptions = useOptions;
export const setUnmappedFilesOptions = setOptions;
export const setUnmappedFilesSort = setSort;
