import Column from 'Components/Table/Column';
import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

export interface StudioScenesOptions {
  sortKey: string;
  sortDirection: SortDirection;
  columns: Column[];
  // Which years are expanded on the details page. One map for every studio, as
  // the slice had it: the page rewrites it to the studio's own years on mount,
  // so a year shared with the studio you came from opens already expanded.
  expandedState: Record<number, boolean>;
}

// Applied after the chosen sort, so equal release dates fall back to title.
// Constant -- the slice held these in state but nothing ever wrote them.
export const SECONDARY_SORT_KEY = 'title';
export const SECONDARY_SORT_DIRECTION = sortDirections.ASCENDING;

const { useOption, getOptions, setOptions, setOption, setSort } =
  createOptionsStore<StudioScenesOptions>('studio_scenes_options', () => {
    return {
      sortKey: 'releaseDate',
      sortDirection: sortDirections.DESCENDING,
      expandedState: {},

      columns: [
        {
          name: 'monitored',
          columnLabel: () => translate('Monitored'),
          label: '',
          isVisible: true,
          isModifiable: false,
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
          isModifiable: false,
        },
      ],
    };
  });

export {
  useOption as useStudioScenesOption,
  getOptions as getStudioScenesOptions,
};

export const setStudioScenesSort = (
  sortKey: string,
  sortDirection: SortDirection
) => {
  setSort({ sortKey, sortDirection });
};

export const setStudioScenesColumns = (columns: Column[]) => {
  setOptions({ columns });
};

export const setStudioScenesExpanded = (
  expandedState: Record<number, boolean>
) => {
  setOption('expandedState', expandedState);
};

export const toggleStudioScenesExpanded = (year: number) => {
  const { expandedState } = getOptions();

  setOption('expandedState', {
    ...expandedState,
    [year]: !expandedState[year],
  });
};
