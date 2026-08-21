import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModelBase from 'App/ModelBase';
import { useSelect } from 'App/SelectContext';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import usePage from 'Helpers/Hooks/usePage';
import {
  setStudioIndexFilter,
  setStudioIndexSort,
  setStudioIndexTableOption,
  setStudioIndexView,
  StudioIndexOptions,
  useStudioIndexOptions,
} from './studioIndexOptionsStore';
import { useStudioIndexQuery } from './useStudioIndexQuery';

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
  const {
    sortKey,
    sortDirection,
    view,
    selectedFilterKey,
    columns,
    posterOptions,
    tableOptions,
  } = useStudioIndexOptions();

  const { page, goToPage } = usePage('studioIndex');
  const customFilters = useCustomFiltersList('studios');

  const navigate = useNavigate();

  // Each view pages at its own configured size.
  const pageSize =
    view === 'posters'
      ? (posterOptions?.pageSize ?? 25)
      : (tableOptions?.pageSize ?? 25);

  // Fetch studio data with React Query, keeping previous data during refetch
  const { data, isPending } = useStudioIndexQuery(
    {
      page,
      pageSize,
      sortKey,
      sortDirection,
    },
    {
      placeholderData: (prev) => prev,
    }
  );

  // UI state
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState<boolean>(false);
  const [jumpToCharacter, setJumpToCharacter] = useState<string | undefined>(
    undefined
  );
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

  const totalRecords = data?.totalRecords || 0;
  const totalPages = data ? Math.ceil(data.totalRecords / pageSize) : 1;

  // Pagination handlers

  /** Navigate to the first page */
  const handleFirstPagePress = useCallback(() => goToPage(1), [goToPage]);

  /** Navigate to the previous page (clamped to page 1) */
  const handlePreviousPagePress = useCallback(
    () => goToPage(Math.max(1, page - 1)),
    [goToPage, page]
  );

  /** Navigate to the next page (clamped to last page) */
  const handleNextPagePress = useCallback(
    () => goToPage(Math.min(totalPages, page + 1)),
    [goToPage, page, totalPages]
  );

  /** Navigate to the last page */
  const handleLastPagePress = useCallback(
    () => goToPage(totalPages),
    [goToPage, totalPages]
  );

  /** Navigate to a specific page */
  const handlePageSelect = useCallback(
    (newPage: number) => goToPage(newPage),
    [goToPage]
  );

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
    (
      payload: Partial<Pick<StudioIndexOptions, 'columns' | 'tableOptions'>>
    ) => {
      setStudioIndexTableOption(payload);
    },
    []
  );

  /**
   * Handle filter selection from the filter menu
   * Resets to first page
   */
  const onFilterSelect = useCallback((value: string | number) => {
    setStudioIndexFilter(value);
  }, []);

  /** Toggle multi-select mode for bulk operations */
  const onSelectModePress = useCallback(() => {
    setIsSelectMode((prev) => !prev);
  }, []);

  /**
   * Change the sort column and reset to first page
   * @param value - The column key to sort by
   */
  const handleSortPress = useCallback((value: string) => {
    setStudioIndexSort(value);
  }, []);

  /**
   * Change the view mode (table, posters, etc.) and scroll to top
   * @param value - table | posters
   */
  const onViewSelect = useCallback((value: string) => {
    setStudioIndexView(value);

    if (scrollerRef.current) {
      scrollerRef.current.scrollTo(0, 0);
    }
  }, []);

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
