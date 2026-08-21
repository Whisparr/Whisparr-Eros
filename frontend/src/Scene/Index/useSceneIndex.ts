import { useCallback, useMemo, useRef, useState } from 'react';
import type Column from 'Components/Table/Column';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import usePage from 'Helpers/Hooks/usePage';
import { MOVIE_INDEX_FILTERS } from 'Movie/Index/movieIndexFilters';
import {
  SceneIndexOverviewOptions,
  SceneIndexPosterOptions,
  SceneIndexTableOptions,
  setSceneIndexFilter,
  setSceneIndexOption,
  setSceneIndexOverviewOption,
  setSceneIndexPosterOption,
  setSceneIndexSort,
  setSceneIndexTableOption,
  setSceneIndexView,
  useSceneIndexOptions,
} from './sceneIndexOptionsStore';
import { useSceneIndexQuery } from './useSceneIndexQuery';

export function useSceneIndex() {
  const {
    sortKey,
    sortDirection,
    view,
    selectedFilterKey,
    columns,
    indexMode,
    posterOptions,
    tableOptions,
    overviewOptions,
  } = useSceneIndexOptions();

  const { page, goToPage } = usePage('sceneIndex');
  const customFilters = useCustomFiltersList('sceneIndex');

  // The overview case was missing here, so the Overview view paged at the table
  // size and ignored its own Page Size setting -- Whisparr/Whisparr#1134.
  function getPageSize() {
    switch (view) {
      case 'posters':
        return posterOptions?.pageSize ?? 25;
      case 'overview':
        return overviewOptions?.pageSize ?? 25;
      default:
        return tableOptions?.pageSize ?? 25;
    }
  }
  const pageSize = getPageSize();

  const { data, isPending, isError } = useSceneIndexQuery({
    page,
    pageSize,
    sortKey,
    sortDirection,
  });

  const totalRecords = data?.totalRecords ?? 0;
  const totalPages = Math.max(Math.ceil(totalRecords / pageSize), 1);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Pagination handlers
  const handleFirstPagePress = useCallback(() => goToPage(1), [goToPage]);
  const handlePreviousPagePress = useCallback(
    () => goToPage(Math.max(1, page - 1)),
    [goToPage, page]
  );
  const handleNextPagePress = useCallback(
    () => goToPage(Math.min(totalPages, page + 1)),
    [goToPage, page, totalPages]
  );
  const handleLastPagePress = useCallback(
    () => goToPage(totalPages),
    [goToPage, totalPages]
  );
  const handlePageSelect = useCallback(
    (newPage: number) => goToPage(newPage),
    [goToPage]
  );

  // Sort, filter, view handlers. Each resets the page, as the reducers did.
  const handleSortPress = useCallback((value: string) => {
    setSceneIndexSort(value);
  }, []);

  const handleFilterSelect = useCallback((value: string | number) => {
    setSceneIndexFilter(value);
  }, []);

  const handleViewSelect = useCallback((value: string) => {
    setSceneIndexView(value);

    if (scrollerRef.current) {
      scrollerRef.current.scrollTo(0, 0);
    }
  }, []);

  const handleTableOptionChange = useCallback(
    (payload: {
      columns?: Column[];
      tableOptions?: SceneIndexTableOptions;
    }) => {
      setSceneIndexTableOption(payload);
    },
    []
  );

  const handlePosterOptionChange = useCallback(
    (payload: Partial<SceneIndexPosterOptions>) => {
      setSceneIndexPosterOption(payload);
    },
    []
  );

  const handleOverviewOptionChange = useCallback(
    (payload: Partial<SceneIndexOverviewOptions>) => {
      setSceneIndexOverviewOption(payload);
    },
    []
  );

  const handleIndexModeChange = useCallback((value: string) => {
    setSceneIndexOption('indexMode', value);
  }, []);

  const handleSelectModePress = useCallback(() => {
    setIsSelectMode((prev) => !prev);
  }, []);

  // Memoize items to give SelectProvider stable references
  const items = useMemo(() => data?.records ?? [], [data?.records]);

  return {
    items,
    totalItems: totalRecords,
    page,
    pageSize,
    totalPages,
    sortKey,
    sortDirection,
    view,
    columns,
    filters: MOVIE_INDEX_FILTERS,
    customFilters,
    selectedFilterKey,
    indexMode,
    isLoading: isPending,
    isError,
    isSelectMode,
    scrollerRef,
    handleFirstPagePress,
    handlePreviousPagePress,
    handleNextPagePress,
    handleLastPagePress,
    handlePageSelect,
    handleSortPress,
    handleFilterSelect,
    handleViewSelect,
    handleTableOptionChange,
    handlePosterOptionChange,
    handleOverviewOptionChange,
    handleIndexModeChange,
    handleSelectModePress,
    setIsSelectMode,
  };
}
