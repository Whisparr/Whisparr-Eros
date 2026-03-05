import { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import {
  setMovieFilter,
  setMovieIndexMode,
  setMovieOverviewOption,
  setMoviePage,
  setMoviePosterOption,
  setMovieSort,
  setMovieTableOption,
  setMovieView,
} from 'Store/Actions/movieIndexActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';
import { useMovieIndexQuery } from './useMovieIndexQuery';

export function useMovieIndex() {
  const dispatch = useDispatch();
  const movieIndexState = useSelector((state: AppState) => state.movieIndex);
  const {
    page,
    sortKey,
    sortDirection,
    view,
    selectedFilterKey,
    columns,
    filters,
    indexMode,
    posterOptions,
    tableOptions,
    overviewOptions,
  } = movieIndexState;

  const customFilters = useSelector(createCustomFiltersSelector('movieIndex'));
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
  const handleFirstPagePress = useCallback(
    () => dispatch(setMoviePage(1)),
    [dispatch]
  );
  const handlePreviousPagePress = useCallback(
    () => dispatch(setMoviePage(Math.max(1, page - 1))),
    [dispatch, page]
  );
  const handleNextPagePress = useCallback(
    () => dispatch(setMoviePage(Math.min(totalPages, page + 1))),
    [dispatch, page, totalPages]
  );
  const handleLastPagePress = useCallback(
    () => dispatch(setMoviePage(totalPages)),
    [dispatch, totalPages]
  );
  const handlePageSelect = useCallback(
    (newPage: number) => dispatch(setMoviePage(newPage)),
    [dispatch]
  );

  // Sort, filter, view handlers
  const handleSortPress = useCallback(
    (value: string) => {
      dispatch(setMovieSort({ sortKey: value }));
    },
    [dispatch]
  );

  const handleFilterSelect = useCallback(
    (value: string | number) => {
      dispatch(setMovieFilter({ selectedFilterKey: value }));
    },
    [dispatch]
  );

  const handleViewSelect = useCallback(
    (value: string) => {
      dispatch(setMovieView({ view: value }));
      if (scrollerRef.current) {
        scrollerRef.current.scrollTo(0, 0);
      }
    },
    [dispatch, scrollerRef]
  );

  const handleTableOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setMovieTableOption(payload));
    },
    [dispatch]
  );

  const handlePosterOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setMoviePosterOption(payload));
    },
    [dispatch]
  );

  const handleOverviewOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setMovieOverviewOption(payload));
    },
    [dispatch]
  );

  const handleIndexModeChange = useCallback(
    (value: string) => {
      dispatch(setMovieIndexMode({ indexMode: value }));
    },
    [dispatch]
  );

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
    filters,
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
