import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
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

export function usePerformerIndex() {
  const dispatch = useDispatch();
  const history = useHistory();
  const safeForWorkMode = React.useContext(SafeForWorkModeContext);

  const page = useSelector((state: AppState) => state.performers.page);
  const sortKey = useSelector((state: AppState) => state.performers.sortKey);
  const sortDirection = useSelector(
    (state: AppState) => state.performers.sortDirection
  );
  const view = useSelector((state: AppState) => state.performers.view);
  const selectedFilterKey = useSelector(
    (state: AppState) => state.performers.selectedFilterKey
  );
  const columns = useSelector((state: AppState) => state.performers.columns);
  const filters = useSelector((state: AppState) => state.performers.filters);
  const customFilters = useSelector(createCustomFiltersSelector('performers'));

  const pageSize = useSelector((state: AppState) => {
    if (view === 'posters') {
      return state.performers.posterOptions?.pageSize ?? 25;
    }
    return state.performers.tableOptions?.pageSize ?? 25;
  });

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
  const handleFirstPagePress = useCallback(
    () => dispatch(setPerformerPage(1)),
    [dispatch]
  );
  const handlePreviousPagePress = useCallback(
    () => dispatch(setPerformerPage(Math.max(1, page - 1))),
    [dispatch, page]
  );
  const handleNextPagePress = useCallback(
    () => dispatch(setPerformerPage(Math.min(totalPages, page + 1))),
    [dispatch, page, totalPages]
  );
  const handleLastPagePress = useCallback(
    () => dispatch(setPerformerPage(totalPages)),
    [dispatch, totalPages]
  );
  const handlePageSelect = useCallback(
    (newPage: number) => dispatch(setPerformerPage(newPage)),
    [dispatch]
  );

  const handleSortPress = useCallback(
    (value: string) => {
      dispatch(setPerformerSort({ sortKey: value }));
      dispatch(setPerformerPage(1));
    },
    [dispatch]
  );

  const handleFilterSelect = useCallback(
    (value: string | number) => {
      dispatch(setPerformerFilter({ selectedFilterKey: value }));
      dispatch(setPerformerPage(1));
    },
    [dispatch]
  );

  const handleViewSelect = useCallback(
    (value: string) => {
      dispatch(setPerformerView({ view: value }));
      if (scrollerRef.current) {
        scrollerRef.current.scrollTo(0, 0);
      }
    },
    [dispatch, scrollerRef]
  );

  const handleTableOptionChange = useCallback(
    (payload: unknown) => dispatch(setPerformerTableOption(payload)),
    [dispatch]
  );

  const handleOptionsPress = useCallback(() => setIsOptionsModalOpen(true), []);

  const handleOptionsModalClose = useCallback(
    () => setIsOptionsModalOpen(false),
    []
  );

  const handleAddPerformerPress = useCallback(
    () => history.push('/add/new/performer'),
    [history]
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
