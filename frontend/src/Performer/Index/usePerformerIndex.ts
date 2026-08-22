import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import usePage from 'Helpers/Hooks/usePage';
import { PERFORMER_INDEX_FILTERS } from './performerIndexFilters';
import {
  PerformerIndexOptions,
  setPerformerIndexFilter,
  setPerformerIndexSort,
  setPerformerIndexTableOption,
  setPerformerIndexView,
  usePerformerIndexOptions,
} from './performerIndexOptionsStore';
import { usePerformerIndexQuery } from './usePerformerIndexQuery';

export function usePerformerIndex() {
  const navigate = useNavigate();
  const safeForWorkMode = React.useContext(SafeForWorkModeContext);

  const {
    sortKey,
    sortDirection,
    view,
    selectedFilterKey,
    columns,
    posterOptions,
    tableOptions,
  } = usePerformerIndexOptions();

  const { page, goToPage } = usePage('performerIndex');
  const filters = PERFORMER_INDEX_FILTERS;
  const customFilters = useCustomFiltersList('performers');

  // Each view pages at its own configured size.
  const pageSize =
    view === 'posters'
      ? (posterOptions?.pageSize ?? 25)
      : (tableOptions?.pageSize ?? 25);

  const { data, isPending, isError } = usePerformerIndexQuery({
    page,
    pageSize,
    sortKey,
    sortDirection,
  });

  const totalRecords = data?.totalRecords ?? 0;
  const totalPages = Math.max(Math.ceil(totalRecords / pageSize), 1);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [jumpToCharacter, setJumpToCharacter] = useState<string | undefined>(
    undefined
  );
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

  const handleSortPress = useCallback((value: string) => {
    setPerformerIndexSort(value);
  }, []);

  const handleFilterSelect = useCallback((value: string | number) => {
    setPerformerIndexFilter(value);
  }, []);

  const handleViewSelect = useCallback((value: string) => {
    setPerformerIndexView(value);

    if (scrollerRef.current) {
      scrollerRef.current.scrollTo(0, 0);
    }
  }, []);

  const handleTableOptionChange = useCallback(
    (
      payload: Partial<Pick<PerformerIndexOptions, 'columns' | 'tableOptions'>>
    ) => {
      setPerformerIndexTableOption(payload);
    },
    []
  );

  const handleOptionsPress = useCallback(() => setIsOptionsModalOpen(true), []);

  const handleOptionsModalClose = useCallback(
    () => setIsOptionsModalOpen(false),
    []
  );

  const handleAddPerformerPress = useCallback(
    () => navigate('/add/new/performer'),
    [navigate]
  );

  const handleSelectModePress = useCallback(
    () => setIsSelectMode((prev) => !prev),
    []
  );

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
    isLoading: isPending,
    isError,
    isOptionsModalOpen,
    isSelectMode,
    jumpToCharacter,
    safeForWorkMode,
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
    handleOptionsPress,
    handleOptionsModalClose,
    handleAddPerformerPress,
    handleSelectModePress,
    setIsSelectMode,
    setJumpToCharacter,
  };
}
