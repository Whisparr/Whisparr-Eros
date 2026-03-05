import { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import {
  setSceneFilter,
  setSceneIndexMode,
  setSceneOverviewOption,
  setScenePage,
  setScenePosterOption,
  setSceneSort,
  setSceneTableOption,
  setSceneView,
} from 'Store/Actions/sceneIndexActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';
import { useSceneIndexQuery } from './useSceneIndexQuery';

export function useSceneIndex() {
  const dispatch = useDispatch();

  const page = useSelector((state: AppState) => state.sceneIndex.page);
  const sortKey = useSelector((state: AppState) => state.sceneIndex.sortKey);
  const sortDirection = useSelector(
    (state: AppState) => state.sceneIndex.sortDirection
  );
  const view = useSelector((state: AppState) => state.sceneIndex.view);
  const selectedFilterKey = useSelector(
    (state: AppState) => state.sceneIndex.selectedFilterKey
  );
  const columns = useSelector((state: AppState) => state.sceneIndex.columns);
  const filters = useSelector((state: AppState) => state.sceneIndex.filters);
  const customFilters = useSelector(createCustomFiltersSelector('sceneIndex'));
  const indexMode = useSelector(
    (state: AppState) => state.sceneIndex.indexMode
  );

  const pageSize = useSelector((state: AppState) => {
    if (state.sceneIndex.view === 'posters') {
      return state.sceneIndex.posterOptions?.pageSize ?? 25;
    }
    return state.sceneIndex.tableOptions?.pageSize ?? 20;
  });

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
  const handleFirstPagePress = useCallback(
    () => dispatch(setScenePage(1)),
    [dispatch]
  );
  const handlePreviousPagePress = useCallback(
    () => dispatch(setScenePage(Math.max(1, page - 1))),
    [dispatch, page]
  );
  const handleNextPagePress = useCallback(
    () => dispatch(setScenePage(Math.min(totalPages, page + 1))),
    [dispatch, page, totalPages]
  );
  const handleLastPagePress = useCallback(
    () => dispatch(setScenePage(totalPages)),
    [dispatch, totalPages]
  );
  const handlePageSelect = useCallback(
    (newPage: number) => dispatch(setScenePage(newPage)),
    [dispatch]
  );

  // Sort, filter, view handlers
  const handleSortPress = useCallback(
    (value: string) => {
      dispatch(setSceneSort({ sortKey: value }));
    },
    [dispatch]
  );

  const handleFilterSelect = useCallback(
    (value: string | number) => {
      dispatch(setSceneFilter({ selectedFilterKey: value }));
    },
    [dispatch]
  );

  const handleViewSelect = useCallback(
    (value: string) => {
      dispatch(setSceneView({ view: value }));
      if (scrollerRef.current) {
        scrollerRef.current.scrollTo(0, 0);
      }
    },
    [dispatch, scrollerRef]
  );

  const handleTableOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setSceneTableOption(payload));
    },
    [dispatch]
  );

  const handlePosterOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setScenePosterOption(payload));
    },
    [dispatch]
  );

  const handleOverviewOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setSceneOverviewOption(payload));
    },
    [dispatch]
  );

  const handleIndexModeChange = useCallback(
    (value: string) => {
      dispatch(setSceneIndexMode({ indexMode: value }));
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
