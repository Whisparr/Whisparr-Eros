import { useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { create } from 'zustand';

// Current page per server-side paged view. Kept out of the option stores
// because it is deliberately not persisted -- a page number is meaningless
// across sessions -- and reset when the user navigates back to a page.
interface PageStore {
  blocklist: number;
  cutoffUnmet: number;
  events: number;
  history: number;
  importListExclusion: number;
  missing: number;
  queue: number;
}

const pageStore = create<PageStore>(() => ({
  blocklist: 1,
  cutoffUnmet: 1,
  events: 1,
  history: 1,
  importListExclusion: 1,
  missing: 1,
  queue: 1,
}));

const usePage = (kind: keyof PageStore) => {
  const navigationType = useNavigationType();

  const goToPage = (page: number) => {
    pageStore.setState({ [kind]: page });
  };

  useEffect(() => {
    if (navigationType === 'POP') {
      pageStore.setState({ [kind]: 1 });
    }
  }, [navigationType, kind]);

  return {
    page: pageStore((state) => state[kind]),
    goToPage,
  };
};

export default usePage;

export const resetPage = (kind: keyof PageStore) => {
  pageStore.setState({ [kind]: 1 });
};
