import Column from 'Components/Table/Column';
import {
  createOptionsStore,
  OptionChanged,
} from 'Helpers/Hooks/useOptionsStore';
import { resetPage } from 'Helpers/Hooks/usePage';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

export interface PerformerIndexPosterOptions {
  detailedProgressBar: boolean;
  size: string;
  showName: boolean;
  pageSize: number;
}

export interface PerformerIndexTableOptions {
  pageSize: number;
  // Rendered as a toggle by the table options modal but read by nothing --
  // `PerformerIndexRow` has no search action, unlike the movie and scene rows.
  // Declared so the control keeps working as it did rather than writing an
  // untyped key; wiring it up (or dropping it) is its own change.
  showSearchAction: boolean;
}

export interface PerformerIndexOptions {
  view: string;
  sortKey: string;
  sortDirection: SortDirection;
  selectedFilterKey: string | number;
  columns: Column[];
  posterOptions: PerformerIndexPosterOptions;
  tableOptions: PerformerIndexTableOptions;
}

const { useOptions, useOption, getOptions, setOptions, setOption, setSort } =
  createOptionsStore<PerformerIndexOptions>('performer_index_options', () => {
    return {
      view: 'posters',
      sortKey: 'sortName',
      sortDirection: sortDirections.ASCENDING,
      selectedFilterKey: 'all',

      posterOptions: {
        detailedProgressBar: false,
        size: 'large',
        showName: true,
        pageSize: 25,
      },

      tableOptions: {
        pageSize: 25,
        showSearchAction: false,
      },

      columns: [
        {
          name: 'status',
          label: '',
          columnLabel: () => translate('Status'),
          isSortable: false,
          isVisible: true,
          isModifiable: false,
        },
        {
          name: 'fullName',
          label: () => translate('PerformerName'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'gender',
          label: () => translate('Gender'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'age',
          label: () => translate('Age'),
          isSortable: true,
          isVisible: false,
          isModifiable: true,
        },
        {
          name: 'country',
          label: () => translate('Country'),
          isSortable: true,
          isVisible: false,
          isModifiable: true,
        },
        {
          name: 'careerStart',
          label: () => translate('CareerStart'),
          isSortable: true,
          isVisible: false,
          isModifiable: true,
        },
        {
          name: 'careerEnd',
          label: () => translate('CareerEnd'),
          isSortable: true,
          isVisible: false,
          isModifiable: true,
        },
        {
          name: 'hairColor',
          label: () => translate('HairColor'),
          isSortable: true,
          isVisible: false,
          isModifiable: true,
        },
        {
          name: 'ethnicity',
          label: () => translate('Ethnicity'),
          isSortable: true,
          isVisible: false,
          isModifiable: true,
        },
        {
          name: 'qualityProfileId',
          label: () => translate('QualityProfile'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'rootFolderPath',
          label: () => translate('RootFolder'),
          isSortable: true,
          isVisible: false,
          isModifiable: true,
        },
        {
          name: 'tags',
          label: () => translate('Tags'),
          isSortable: false,
          isVisible: false,
          isModifiable: true,
        },
        {
          name: 'totalMovieCount',
          label: () => translate('Movies'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'totalSceneCount',
          label: () => translate('Scenes'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'sizeOnDisk',
          label: () => translate('SizeOnDisk'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'actions',
          label: '',
          columnLabel: () => translate('Actions'),
          isSortable: false,
          isVisible: true,
          isModifiable: false,
        },
      ],
    };
  });

export {
  useOptions as usePerformerIndexOptions,
  useOption as usePerformerIndexOption,
  getOptions as getPerformerIndexOptions,
  setOptions as setPerformerIndexOptions,
  setOption as setPerformerIndexOption,
};

// Sorting and filtering invalidate the current page number, exactly as the
// reducers they replace did. Switching view did not, and still does not -- it
// scrolls to the top instead.
export const setPerformerIndexSort = (sortKey: string) => {
  setSort({ sortKey });
  resetPage('performerIndex');
};

export const setPerformerIndexFilter = (selectedFilterKey: string | number) => {
  setOption('selectedFilterKey', selectedFilterKey);
  resetPage('performerIndex');
};

export const setPerformerIndexView = (view: string) => {
  setOption('view', view);
};

// The poster options modal sends a partial set of its own keys, so those merge
// into the sub-object rather than replacing it.
export const setPerformerIndexPosterOption = (
  payload: Partial<PerformerIndexPosterOptions>
) => {
  setOption('posterOptions', { ...getOptions().posterOptions, ...payload });
};

// The table options modal sends `{ tableOptions }`; the column modal sends
// `{ columns }`. The redux reducer picked those same keys off one payload.
export const setPerformerIndexTableOption = (
  payload: Partial<Pick<PerformerIndexOptions, 'columns' | 'tableOptions'>>
) => {
  setOptions(payload);
};

export type PerformerIndexOptionChanged = OptionChanged<PerformerIndexOptions>;
