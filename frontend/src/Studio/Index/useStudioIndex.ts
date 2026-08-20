import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ModelBase from 'App/ModelBase';
import { useSelect } from 'App/SelectContext';
import AppState from 'App/State/AppState';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import { fetchGeneralSettings } from 'Store/Actions/Settings/general';
import {
  setStudioFilter,
  setStudioPage,
  setStudioSort,
  setStudioTableOption,
  setStudioView,
} from 'Store/Actions/studioActions';
import { useStudioIndexQuery } from './useStudioIndexQuery';

/**
 * Filter configuration for studio queries
 */
interface PageFilter {
  key: string;
  operator: string;
  value: string | number | boolean;
}

/**
 * Hook to fetch and manage general application settings.
 * Dispatches the fetchGeneralSettings action on mount and returns the general settings state.
 *
 * @returns {AppState['settings']['general']['item']} The general settings object
 */
export function useGeneralSettings() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGeneralSettings());
  }, [dispatch]);

  return useSelector((state: AppState) => state.settings.general.item);
}

function StudioSelectModeReinitializer({
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
 * Custom hook for managing the Studio Index page state and interactions.
 *
 * Provides a centralized interface for:
 * - Server-side paginated studio data fetching
 * - Pagination controls and state management
 * - Sorting and filtering operations
 * - View mode toggling (table, posters, etc.)
 * - UI interactions (options modal, select mode, etc.)
 *
 * @returns An object containing studio data, state, and event handlers
 */
export function useStudioIndex() {
  // Paging and sorting state from Redux store
  const filters: PageFilter[] = [];
  const customFilters = useCustomFiltersList('studios');
  const columns = useSelector((state: AppState) => state.studios.columns);
  const selectedFilterKey = useSelector(
    (state: AppState) => state.studios.selectedFilterKey
  );
  const sortKey = useSelector((state: AppState) => state.studios.sortKey);
  const page = useSelector((state: AppState) => state.studios.page);
  const sortDirection = useSelector(
    (state: AppState) => state.studios.sortDirection
  );
  const view = useSelector((state: AppState) => state.studios.view);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read pageSize from the appropriate options based on view
  const pageSize = useSelector((state: AppState) => {
    if (view === 'posters') {
      return state.studios.posterOptions?.pageSize ?? 25;
    }
    return state.studios.tableOptions?.pageSize ?? 25;
  });

  // Build query parameters for data fetching
  const queryParams = {
    page,
    pageSize,
    sortKey,
    sortDirection,
    filters,
  };

  // Fetch studio data with React Query, keeping previous data during refetch
  const { data, isPending } = useStudioIndexQuery(queryParams, {
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
  const handleFirstPagePress = () => dispatch(setStudioPage(1));

  /** Navigate to the previous page (clamped to page 1) */
  const handlePreviousPagePress = () =>
    dispatch(setStudioPage(Math.max(1, page - 1)));

  /** Navigate to the next page (clamped to last page) */
  const handleNextPagePress = () =>
    dispatch(setStudioPage(Math.min(totalPages, page + 1)));

  /** Navigate to the last page */
  const handleLastPagePress = () => dispatch(setStudioPage(totalPages));

  /** Navigate to a specific page */
  const handlePageSelect = (newPage: number) =>
    dispatch(setStudioPage(newPage));

  /** Open the table options modal */
  const onOptionsPress = useCallback(() => {
    setIsOptionsModalOpen(true);
  }, [setIsOptionsModalOpen]);

  /** Close the table options modal */
  const onOptionsModalClose = useCallback(() => {
    setIsOptionsModalOpen(false);
  }, [setIsOptionsModalOpen]);

  /** Navigate to the add studio page */
  const onAddStudioPress = useCallback(() => {
    navigate('/add/new/studio');
  }, [navigate]);

  /** Handle changes to table display options (columns, etc.) */
  const onTableOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setStudioTableOption(payload));
    },
    [dispatch]
  );

  /**
   * Monitors isSelectMode and reinitializes the selection state when entering select mode.
   * This ensures that the select all button works correctly after exiting and re-entering select mode.
   */

  const generalSettings = useGeneralSettings();

  // Determine if we should show the movie monitor toggle
  const showMovieMonitorToggle = useMemo(() => {
    return generalSettings?.whisparrMovieMetadataSource !== 'none';
  }, [generalSettings?.whisparrMovieMetadataSource]);

  /**
   * Handle filter selection from the filter menu
   * Resets to first page
   */
  const onFilterSelect = useCallback(
    (value: string | number) => {
      dispatch(setStudioFilter({ selectedFilterKey: value }));
      dispatch(setStudioPage(1));
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
      dispatch(setStudioSort({ sortKey: value }));
      dispatch(setStudioPage(1));
    },
    [dispatch]
  );

  /**
   * Change the view mode (table, posters, etc.) and scroll to top
   * @param value - table | posters
   */
  const onViewSelect = useCallback(
    (value: string) => {
      dispatch(setStudioView({ view: value }));

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
    scrollerRef,
    selectedFilterKey,
    view,

    // Derived data
    showMovieMonitorToggle,

    handleFirstPagePress,
    handleLastPagePress,
    handleNextPagePress,
    handlePageSelect,
    handlePreviousPagePress,
    handleSortPress,
    StudioSelectModeReinitializer,
    onAddStudioPress,
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
