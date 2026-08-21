import { useCallback, useMemo, useRef, useState } from 'react';
import type Column from 'Components/Table/Column';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import usePage from 'Helpers/Hooks/usePage';
import { filters as movieIndexFilters } from 'Store/Actions/movieActions';
import {
  MovieIndexOverviewOptions,
  MovieIndexPosterOptions,
  MovieIndexTableOptions,
  setMovieIndexFilter,
  setMovieIndexOption,
  setMovieIndexOverviewOption,
  setMovieIndexPosterOption,
  setMovieIndexSort,
  setMovieIndexTableOption,
  setMovieIndexView,
  useMovieIndexOptions,
} from './movieIndexOptionsStore';
import { useMovieIndexQuery } from './useMovieIndexQuery';

export function useMovieIndex() {
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
  } = useMovieIndexOptions();

  const { page, goToPage } = usePage('movieIndex');
  const customFilters = useCustomFiltersList('movieIndex');

  function getPageSize() {
    switch (view) {
      case 'posters':
        return posterOptions?.pageSize ?? 25;
      case 'overview':
        return overviewOptions?.pageSize ?? 25;
      default:
        return tableOptions?.pageSize ?? 20;
    }
  }
  const pageSize = getPageSize();

  const { data, isPending, isError } = useMovieIndexQuery({
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
    setMovieIndexSort(value);
  }, []);

  const handleFilterSelect = useCallback((value: string | number) => {
    setMovieIndexFilter(value);
  }, []);

  const handleViewSelect = useCallback((value: string) => {
    setMovieIndexView(value);

    if (scrollerRef.current) {
      scrollerRef.current.scrollTo(0, 0);
    }
  }, []);

  const handleTableOptionChange = useCallback(
    (payload: {
      columns?: Column[];
      tableOptions?: MovieIndexTableOptions;
    }) => {
      setMovieIndexTableOption(payload);
    },
    []
  );

  const handlePosterOptionChange = useCallback(
    (payload: Partial<MovieIndexPosterOptions>) => {
      setMovieIndexPosterOption(payload);
    },
    []
  );

  const handleOverviewOptionChange = useCallback(
    (payload: Partial<MovieIndexOverviewOptions>) => {
      setMovieIndexOverviewOption(payload);
    },
    []
  );

  const handleIndexModeChange = useCallback((value: string) => {
    setMovieIndexOption('indexMode', value);
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
    filters: movieIndexFilters,
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
