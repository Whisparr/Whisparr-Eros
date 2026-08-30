import { create } from 'zustand';
import { createPersist } from 'Helpers/createPersist';
import { applySort } from 'Helpers/Hooks/useOptionsStore';
import { SortDirection } from 'Helpers/Props/sortDirections';

interface ReleaseFilterState {
  selectedFilterKey: string | number;
}

// Replaces `persistState: ['releases.selectedFilterKey']` -- the only thing the
// slice kept across opens, because `CLEAR_RELEASES` spread the rest of
// `defaultState` back over the section every time the modal closed.
const filterStore = createPersist<ReleaseFilterState>(
  'release_options',
  () => ({
    selectedFilterKey: 'all',
  })
);

export const useReleaseFilterKey = () =>
  filterStore((state) => state.selectedFilterKey);

export const setReleasesFilter = (selectedFilterKey: string | number) => {
  filterStore.setState({ selectedFilterKey });
};

interface ReleaseSortState {
  sortKey: string;
  sortDirection: SortDirection;
}

// Sort is deliberately not persisted: `CLEAR_RELEASES` reset it on every close,
// so it never outlived a single search.
const sortStore = create<ReleaseSortState>(() => ({
  sortKey: 'releaseWeight',
  sortDirection: 'ascending',
}));

export const useReleaseSort = () => sortStore((state) => state);

export const setReleasesSort = (
  sortKey: string,
  sortDirection?: SortDirection
) => {
  sortStore.setState((state) => applySort(state, sortKey, sortDirection));
};
