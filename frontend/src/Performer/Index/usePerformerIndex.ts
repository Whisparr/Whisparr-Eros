import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ModelBase from 'App/ModelBase';
import { useSelect } from 'App/SelectContext';
import AppState from 'App/State/AppState';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import {
  setPerformerFilter,
  setPerformerPage,
  setPerformerSort,
  setPerformerTableOption,
  setPerformerView,
} from 'Store/Actions/performerActions';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';
import { usePerformerIndexQuery } from './usePerformerIndexQuery';

/**
 * Filter configuration for performer queries
 */
interface PageFilter {
  key: string;
  operator: string;
  value: string | number | boolean;
}

/**
 * Custom hook for managing the Performer Index page state and interactions.
 *
 * Provides a centralized interface for:
 * - Server-side paginated performer data fetching
 * - Pagination controls and state management
 * - Sorting and filtering operations
 * - View mode toggling (table, posters, etc.)
 * - UI interactions (options modal, select mode, etc.)
 *
 * @returns An object containing performer data, state, and event handlers
 */
export function usePerformerIndex() {
  // Paging and sorting state from Redux store
  const filters: PageFilter[] = [];
  const customFilters = useSelector(createCustomFiltersSelector('performer'));
  const columns = useSelector((state: AppState) => state.performers.columns);
  const safeForWorkMode = React.useContext(SafeForWorkModeContext);
  const selectedFilterKey = useSelector(
    (state: AppState) => state.performers.selectedFilterKey
  );
  const sortKey = useSelector((state: AppState) => state.performers.sortKey);
  const page = useSelector((state: AppState) => state.performers.page);
  const sortDirection = useSelector(
    (state: AppState) => state.performers.sortDirection
  );
  const view = useSelector((state: AppState) => state.performers.view);

  // Read pageSize from the appropriate options based on view
  const pageSize = useSelector((state: AppState) => {
    if (view === 'posters') {
      return state.performers.posterOptions?.pageSize ?? 25;
    }
    return state.performers.tableOptions?.pageSize ?? 25;
  });

  // Build query parameters for data fetching
  const queryParams = {
    page,
    pageSize,
    sortKey,
    sortDirection,
    filters,
  };

  const history = useHistory();
  const dispatch = useDispatch();

  // Fetch performer data with React Query, keeping previous data during refetch
  const { data, isPending } = usePerformerIndexQuery(queryParams, {
    placeholderData: (prev) => prev,
  });

  // UI state
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState<boolean>(false);
  const [jumpToCharacter, setJumpToCharacter] = useState<string | undefined>(
    undefined
  );
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

  // Pagination handlers

  const totalRecords = data?.totalRecords || 0;
  const totalPages = data ? Math.ceil(data.totalRecords / pageSize) : 1;

  /** Navigate to the first page */
  const handleFirstPagePress = () => dispatch(setPerformerPage(1));

  /** Navigate to the previous page (clamped to page 1) */
  const handlePreviousPagePress = () =>
    dispatch(setPerformerPage(Math.max(1, page - 1)));

  /** Navigate to the next page (clamped to last page) */
  const handleNextPagePress = () =>
    dispatch(setPerformerPage(Math.min(totalPages, page + 1)));

  /** Navigate to the last page */
  const handleLastPagePress = () => dispatch(setPerformerPage(totalPages));

  /** Navigate to a specific page */
  const handlePageSelect = (newPage: number) =>
    dispatch(setPerformerPage(newPage));

  /** Open the table options modal */
  const onOptionsPress = useCallback(() => {
    setIsOptionsModalOpen(true);
  }, [setIsOptionsModalOpen]);

  /** Close the table options modal */
  const onOptionsModalClose = useCallback(() => {
    setIsOptionsModalOpen(false);
  }, [setIsOptionsModalOpen]);

  /** Navigate to the add performer page */
  const onAddPerformerPress = useCallback(() => {
    history.push('/add/new/performer');
  }, [history]);

  /** Handle changes to table display options (columns, etc.) */
  const onTableOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setPerformerTableOption(payload));
    },
    [dispatch]
  );

  /**
   * Monitors isSelectMode and reinitializes the selection state when entering select mode.
   * This ensures that the select all button works correctly after exiting and re-entering select mode.
   */
  function PerformerSelectModeReinitializer({
    isSelectMode,
    items,
  }: {
    isSelectMode: boolean;
    items: ModelBase[];
  }) {
    const [, selectDispatch] = useSelect();

    // When entering select mode, reinitialize the selection state based on current items
    useEffect(() => {
      if (isSelectMode) {
        selectDispatch({ type: 'updateItems', items });
      }
    }, [isSelectMode, items, selectDispatch]);

    return null;
  }

  /**
   * Handle filter selection from the filter menu
   * Resets to default sort (sortName, ascending) and first page
   */
  const onFilterSelect = useCallback(
    (value: string | number) => {
      // dispatch(setPerformerSort({ sortKey: 'sortName' }));
      dispatch(setPerformerFilter({ selectedFilterKey: value }));
      // dispatch(setPerformerSortDirection({ sortDirection: ASCENDING }));
      dispatch(setPerformerPage(1));
    },
    [dispatch]
  );

  /** Toggle multi-select mode for bulk operations */
  const onSelectModePress = useCallback(() => {
    setIsSelectMode(!isSelectMode);
  }, [isSelectMode, setIsSelectMode]);

  /**
   * Change the sort column and reset to first page
   * @param value - The column key to sort by
   */
  const handleSortPress = useCallback(
    (value: string) => {
      dispatch(setPerformerSort({ sortKey: value }));
      dispatch(setPerformerPage(1));
    },
    [dispatch]
  );

  /**
   * Change the view mode (table, posters, etc.) and scroll to top
   * @param value - table | posters
   */
  const onViewSelect = useCallback(
    (value: string) => {
      dispatch(setPerformerView({ view: value }));

      if (scrollerRef.current) {
        scrollerRef.current.scrollTo(0, 0);
      }
    },
    [scrollerRef, dispatch]
  );

  // Memoize items to ensure SelectProvider receives consistent references for its useEffect
  const memoizedItems = useMemo(() => data?.records || [], [data?.records]);

  return {
    items: memoizedItems,
    totalItems: totalRecords,
    page,
    pageSize,
    totalPages,
    sortKey,
    sortDirection,
    columns,
    customFilters,
    isFetching: isPending,
    isOptionsModalOpen,
    isSelectMode,
    jumpToCharacter,
    safeForWorkMode,
    scrollerRef,
    selectedFilterKey,
    view,
    handleFirstPagePress,
    handleLastPagePress,
    handleNextPagePress,
    handlePageSelect,
    handlePreviousPagePress,
    handleSortPress,
    PerformerSelectModeReinitializer,
    onAddPerformerPress,
    onFilterSelect,
    onOptionsModalClose,
    onOptionsPress,
    onSelectModePress,
    onTableOptionChange,
    onViewSelect,
    setIsSelectMode,
    setJumpToCharacter,
  };
}
