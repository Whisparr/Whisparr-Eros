import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';

export interface CollectionOverviewOptions {
  detailedProgressBar: boolean;
  size: string;
  showDetails: boolean;
  showOverview: boolean;
  showPosters: boolean;
}

export interface CollectionOptions {
  sortKey: string;
  sortDirection: SortDirection;
  selectedFilterKey: string | number;
  overviewOptions: CollectionOverviewOptions;
}

// Replaces the `movieCollections.*` entries of `persistState`. The slice also
// persisted `defaults` and `options`; neither is here because nothing read
// either one -- `defaults` had no reader at all, and `options` was never even
// in `defaultState`, so `setMovieCollectionsOption` wrote to a key the page
// only ever spread back as `undefined`.
const {
  useOption,
  useOptions,
  getOptions,
  setOption: setCollectionOption,
  setSort,
} = createOptionsStore<CollectionOptions>('collection_options', () => ({
  sortKey: 'sortTitle',
  sortDirection: sortDirections.ASCENDING,
  selectedFilterKey: 'all',

  overviewOptions: {
    detailedProgressBar: false,
    size: 'medium',
    showDetails: true,
    showOverview: true,
    showPosters: true,
  },
}));

export const useCollectionOptions = useOptions;
export const useCollectionOption = useOption;
export const getCollectionOptions = getOptions;
export const setCollectionSort = setSort;

export function setCollectionFilter(selectedFilterKey: string | number) {
  setCollectionOption('selectedFilterKey', selectedFilterKey);
}

export function setCollectionOverviewOption(
  option: Partial<CollectionOverviewOptions>
) {
  setCollectionOption('overviewOptions', {
    ...getOptions().overviewOptions,
    ...option,
  });
}
