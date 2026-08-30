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
  setPerformerScenesColumns,
  setPerformerScenesSort,
  usePerformerScenesOption,
} from './performerScenesOptionsStore';

interface PerformerDetailsYearState {
  items: Movie[];
  isSmallScreen: boolean;
  columns: Column[];
  sortKey: string;
  sortDirection: SortDirection;
}

interface PerformerDetailsYearActions {
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

export function usePerformerDetailsYearData(
  items: Movie[]
): PerformerDetailsYearState {
  const columns = usePerformerScenesOption('columns');
  const sortKey = usePerformerScenesOption('sortKey');
  const sortDirection = usePerformerScenesOption('sortDirection');
  const { isSmallScreen } = useAppDimensions();

  return {
    items: sort(items, sortKey, sortDirection),
    isSmallScreen,
    columns,
    sortKey,
    sortDirection,
  };
}

export function usePerformerDetailsYearActions(
  items: Movie[]
): PerformerDetailsYearActions {
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
      setPerformerScenesColumns(columns);
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

      setPerformerScenesSort(sortKey, nextDirection);
    },
    []
  );

  // The performer page searches the monitored movies of the year directly.
  // There is no performer equivalent of `STUDIO_SEARCH`'s `years` parameter.
  const onSearchPress = useCallback(() => {
    const monitoredMovieIds = items
      .filter((movie) => movie.monitored)
      .map((movie) => movie.id);

    if (!monitoredMovieIds.length) {
      return;
    }

    executeCommand({
      name: commandNames.MOVIE_SEARCH,
      movieIds: monitoredMovieIds,
    });
  }, [items, executeCommand]);

  return {
    onMonitorYearPress,
    onTableOptionChange,
    onSortPress,
    onSearchPress,
  };
}
