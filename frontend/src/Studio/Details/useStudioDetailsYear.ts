import _ from 'lodash';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import * as commandNames from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import Column from 'Components/Table/Column';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import { bulkMonitorMovie } from 'Store/Actions/movieActions';
import {
  setStudioScenesSort,
  setStudioScenesTableOption,
} from 'Store/Actions/studioScenesActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import { TableOptionsChangePayload } from 'typings/Table';

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

interface StudioScenesState {
  columns: Column[];
  sortKey: string;
  sortDirection: SortDirection;
  secondarySortKey?: string;
  secondarySortDirection?: SortDirection;
  sortPredicates?: Record<
    string,
    (item: Movie, sortDirection: SortDirection) => unknown
  >;
}

function getSortClause(
  sortKey: string,
  sortDirection: SortDirection,
  sortPredicates?: Record<
    string,
    (item: Movie, sortDirection: SortDirection) => unknown
  >
) {
  if (sortPredicates && sortPredicates.hasOwnProperty(sortKey)) {
    return function (item: Movie) {
      return sortPredicates[sortKey](item, sortDirection);
    };
  }

  return function (item: Movie) {
    return item[sortKey as keyof Movie];
  };
}

function sort(items: Movie[], state: StudioScenesState) {
  const {
    sortKey,
    sortDirection,
    sortPredicates,
    secondarySortKey,
    secondarySortDirection,
  } = state;

  const clauses: Array<(item: Movie) => unknown> = [];
  const orders: Array<'asc' | 'desc'> = [];

  clauses.push(getSortClause(sortKey, sortDirection, sortPredicates));
  orders.push(sortDirection === sortDirections.ASCENDING ? 'asc' : 'desc');

  if (
    secondarySortKey &&
    secondarySortDirection &&
    (sortKey !== secondarySortKey || sortDirection !== secondarySortDirection)
  ) {
    clauses.push(
      getSortClause(secondarySortKey, secondarySortDirection, sortPredicates)
    );
    orders.push(
      secondarySortDirection === sortDirections.ASCENDING ? 'asc' : 'desc'
    );
  }

  return _.orderBy(items, clauses, orders);
}

export function useStudioDetailsYearData(
  items: Movie[]
): StudioDetailsYearState {
  const studioScenes = useSelector(
    (state: AppState & { studioScenes: StudioScenesState }) =>
      state.studioScenes
  );
  const dimensions = useSelector(createDimensionsSelector());

  const sortedItems = sort(items, studioScenes);

  return {
    items: sortedItems,
    isSmallScreen: dimensions.isSmallScreen,
    isSearching: false,
    columns: studioScenes.columns,
    sortKey: studioScenes.sortKey,
    sortDirection: studioScenes.sortDirection as SortDirection,
  };
}

export function useStudioDetailsYearActions(
  studioId: number,
  year: number,
  items: Movie[]
): StudioDetailsYearActions {
  const dispatch = useDispatch();
  const executeCommand = useExecuteCommand();

  const onMonitorYearPress = useCallback(() => {
    const allMonitored = items.every((movie: Movie) => movie.monitored);
    const newMonitoredState = !allMonitored;
    const ids = items.map((item: Movie) => item.id);
    dispatch(bulkMonitorMovie({ ids, monitored: newMonitoredState }));
  }, [dispatch, items]);

  const onTableOptionChange = useCallback(
    (payload: TableOptionsChangePayload) => {
      dispatch(setStudioScenesTableOption(payload));
    },
    [dispatch]
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

      dispatch(
        setStudioScenesSort({
          sortKey,
          sortDirection: nextDirection,
        })
      );
    },
    [dispatch]
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
