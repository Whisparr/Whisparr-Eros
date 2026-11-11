import { create } from 'zustand';

// Current page per server-side paged view. Kept out of the option stores
// because it is deliberately not persisted -- a page number is meaningless
// across sessions -- but kept in memory so browser back returns to it.
interface PageStore {
  blocklist: number;
  cutoffUnmet: number;
  events: number;
  history: number;
  importListExclusion: number;
  missing: number;
  movieIndex: number;
  performerIndex: number;
  queue: number;
  sceneIndex: number;
  studioIndex: number;
}

const pageStore = create<PageStore>(() => ({
  blocklist: 1,
  cutoffUnmet: 1,
  events: 1,
  history: 1,
  importListExclusion: 1,
  missing: 1,
  movieIndex: 1,
  performerIndex: 1,
  queue: 1,
  sceneIndex: 1,
  studioIndex: 1,
}));

const usePage = (kind: keyof PageStore) => {
  const goToPage = (page: number) => {
    pageStore.setState({ [kind]: page });
  };

  return {
    page: pageStore((state) => state[kind]),
    goToPage,
  };
};

export default usePage;

export const resetPage = (kind: keyof PageStore) => {
  pageStore.setState({ [kind]: 1 });
};
