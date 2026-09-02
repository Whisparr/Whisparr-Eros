import Column from 'Components/Table/Column';
import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

export interface PerformerScenesOptions {
  sortKey: string;
  sortDirection: SortDirection;
  columns: Column[];
}

// Applied after the chosen sort, so equal release dates fall back to title.
// Constant -- the slice held these in state but nothing ever wrote them.
export const SECONDARY_SORT_KEY = 'title';
export const SECONDARY_SORT_DIRECTION = sortDirections.ASCENDING;

const { useOption, setOptions, setSort } =
  createOptionsStore<PerformerScenesOptions>('performer_scenes_options', () => {
    return {
      sortKey: 'releaseDate',
      sortDirection: sortDirections.DESCENDING,

      columns: [
        {
          name: 'monitored',
          columnLabel: () => translate('Monitored'),
          label: '',
          isVisible: true,
          isModifiable: 'disabled',
        },
        {
          name: 'title',
          label: () => translate('Title'),
          isVisible: true,
          isSortable: true,
        },
        {
          name: 'credits',
          label: () => translate('Performers'),
          isVisible: true,
        },
        {
          name: 'path',
          label: () => translate('Path'),
          isVisible: false,
          isSortable: true,
        },
        {
          name: 'releaseDate',
          label: () => translate('ReleaseDate'),
          isVisible: true,
          isSortable: true,
        },
        {
          name: 'runtime',
          label: () => translate('Runtime'),
          isVisible: false,
          isSortable: true,
        },
        {
          name: 'studioTitle',
          label: () => translate('Studio'),
          isVisible: true,
          isSortable: true,
        },
        {
          name: 'sizeOnDisk',
          label: () => translate('Size'),
          isVisible: false,
          isSortable: true,
        },
        {
          name: 'status',
          label: () => translate('Status'),
          isVisible: true,
        },
        {
          name: 'actions',
          columnLabel: () => translate('Actions'),
          label: '',
          isVisible: true,
          isModifiable: 'disabled',
        },
      ],
    };
  });

export { useOption as usePerformerScenesOption };

export const setPerformerScenesSort = (
  sortKey: string,
  sortDirection: SortDirection
) => {
  setSort({ sortKey, sortDirection });
};

export const setPerformerScenesColumns = (columns: Column[]) => {
  setOptions({ columns });
};
