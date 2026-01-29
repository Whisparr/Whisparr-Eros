import { useDispatch } from 'react-redux';
import * as commands from 'Commands/commandNames';
import {
  ASCENDING,
  DESCENDING,
  SortDirection,
} from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import { executeCommand } from 'Store/Actions/commandActions';
import {
  bulkMonitorMovie,
  toggleMovieMonitored,
} from 'Store/Actions/movieActions';
import {
  setPerformerScenesSort,
  setPerformerScenesTableOption,
} from 'Store/Actions/performerScenesActions';

export function usePerformerDetailsYearActions() {
  const dispatch = useDispatch();

  function searchMonitoredMovies(movies: Movie[]) {
    if (!Array.isArray(movies) || movies.length === 0) return;
    const monitoredMovieIds = movies
      .filter((m) => m.monitored)
      .map((m) => m.id);
    if (monitoredMovieIds.length === 0) return;
    dispatch(
      executeCommand({
        name: commands.MOVIE_SEARCH,
        movieIds: monitoredMovieIds,
      })
    );
  }

  function monitorMovie(movieId: number, monitored: boolean) {
    dispatch(toggleMovieMonitored({ movieId, monitored }));
  }

  function bulkMonitor(movies: Movie[]) {
    if (!Array.isArray(movies) || movies.length === 0) return;
    const ids = movies.map((m: Movie) => m.id);
    const monitored = !movies.every((m: Movie) => m.monitored);
    dispatch(bulkMonitorMovie({ ids, monitored }));
  }

  function tableOptionChange(payload: unknown) {
    dispatch(setPerformerScenesTableOption(payload));
  }

  function sortPress(
    name: string,
    direction: SortDirection,
    sortKey: string,
    sortDirection: SortDirection,
    propOnSortPress?: (name: string, direction: SortDirection) => void
  ) {
    let useDirection = direction;
    if (!useDirection) {
      if (name === sortKey) {
        useDirection = sortDirection === ASCENDING ? DESCENDING : ASCENDING;
      } else {
        useDirection = ASCENDING;
      }
    }
    dispatch(
      setPerformerScenesSort({ sortKey: name, sortDirection: useDirection })
    );
    if (propOnSortPress) {
      propOnSortPress(name, useDirection);
    }
  }

  return {
    searchMonitoredMovies,
    monitorMovie,
    bulkMonitor,
    tableOptionChange,
    sortPress,
  };
}
