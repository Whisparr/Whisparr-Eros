import { orderBy } from 'lodash';
import { useCallback } from 'react';
import { useAppDimensions } from 'App/appStore';
import * as commandNames from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import Column from 'Components/Table/Column';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import { useBulkMonitorMovies } from 'Movie/useMovie';
import { TableOptionsChangePayload } from 'typings/Table';
import {
  SECONDARY_SORT_DIRECTION,
  SECONDARY_SORT_KEY,
  setStudioScenesColumns,
  setStudioScenesSort,
  useStudioScenesOption,
} from './studioScenesOptionsStore';

interface StudioDetailsYearState {
  items: Movie[];
  isSmallScreen: boolean;
  isSearching: boolean;
  columns: Column[];
  sortKey: string;
  sortDirection: SortDirection;
}

interface StudioDetailsYearActions {
  onMonitorYearPress: () => void;
  onTableOptionChange: (payload: TableOptionsChangePayload) => void;
  onSortPress: (
    sortKey: string,
    sortDirection: SortDirection | undefined,
    currentSortKey: string,
    currentSortDirection: SortDirection
  ) => void;
  onSearchPress: () => void;
}

function getSortClause(sortKey: string) {
  return function (item: Movie) {
    return item[sortKey as keyof Movie];
  };
}

function sort(
  items: Movie[],
  sortKey: string,
  sortDirection: SortDirection
): Movie[] {
  const clauses = [getSortClause(sortKey)];
  const orders: Array<'asc' | 'desc'> = [
    sortDirection === sortDirections.ASCENDING ? 'asc' : 'desc',
  ];

  if (
    sortKey !== SECONDARY_SORT_KEY ||
    sortDirection !== SECONDARY_SORT_DIRECTION
  ) {
    clauses.push(getSortClause(SECONDARY_SORT_KEY));
    orders.push(
      SECONDARY_SORT_DIRECTION === sortDirections.ASCENDING ? 'asc' : 'desc'
    );
  }

  return orderBy(items, clauses, orders);
}

export function useStudioDetailsYearData(
  items: Movie[]
): StudioDetailsYearState {
  const columns = useStudioScenesOption('columns');
  const sortKey = useStudioScenesOption('sortKey');
  const sortDirection = useStudioScenesOption('sortDirection');
  const { isSmallScreen } = useAppDimensions();

  return {
    items: sort(items, sortKey, sortDirection),
    isSmallScreen,
    isSearching: false,
    columns,
    sortKey,
    sortDirection,
  };
}

export function useStudioDetailsYearActions(
  studioId: number,
  year: number,
  items: Movie[]
): StudioDetailsYearActions {
  const executeCommand = useExecuteCommand();

  const monitorMovies = useBulkMonitorMovies(true);
  const unmonitorMovies = useBulkMonitorMovies(false);

  const onMonitorYearPress = useCallback(() => {
    const allMonitored = items.every((movie) => movie.monitored);
    const mutation = allMonitored ? unmonitorMovies : monitorMovies;

    mutation.mutate(items.map((item) => item.id));
  }, [items, monitorMovies, unmonitorMovies]);

  const onTableOptionChange = useCallback(
    ({ columns }: TableOptionsChangePayload) => {
      setStudioScenesColumns(columns);
    },
    []
  );

  const onSortPress = useCallback(
    (
      sortKey: string,
      sortDirection: SortDirection | undefined,
      currentSortKey: string,
      currentSortDirection: SortDirection
    ) => {
      let nextDirection = sortDirection;

      if (!nextDirection) {
        if (sortKey === currentSortKey) {
          nextDirection =
            currentSortDirection === sortDirections.ASCENDING
              ? sortDirections.DESCENDING
              : sortDirections.ASCENDING;
        } else {
          nextDirection = sortDirections.ASCENDING;
        }
      }

      setStudioScenesSort(sortKey, nextDirection);
    },
    []
  );

  const onSearchPress = useCallback(() => {
    executeCommand({
      name: commandNames.STUDIO_SEARCH,
      studioIds: [studioId],
      years: [year],
    });
  }, [studioId, year, executeCommand]);

  return {
    onMonitorYearPress,
    onTableOptionChange,
    onSortPress,
    onSearchPress,
  };
}
