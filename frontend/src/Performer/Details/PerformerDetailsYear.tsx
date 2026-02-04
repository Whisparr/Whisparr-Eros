import React from 'react';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import Popover from 'Components/Tooltip/Popover';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import { ASCENDING, SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import YearInfo from 'Studio/Details/YearInfo';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import SceneRow from './SceneRow';
import { usePerformerDetailsYearActions } from './usePerformerDetailsYear';
import styles from './PerformerDetailsYear.css';

interface PerformerDetailsYearProps {
  performerId: number;
  columns: Column[];
  year: number;
  movies: Movie[];
  sortDirection: SortDirection;
  sortKey: string;
  isSmallScreen: boolean;
  isExpanded?: boolean;
  safeForWorkMode?: boolean;
  onYearRefreshPress?: (ids: number[]) => void;
  onExpandPress: (year: number, expand: boolean) => void;
  onSortPress?: (name: string, direction: SortDirection) => void;
  bulkMonitorMovie?: (args: { ids: number[]; monitored: boolean }) => void;
}

function PerformerDetailsYear(props: PerformerDetailsYearProps) {
  const {
    movies,
    year,
    columns,
    sortKey,
    sortDirection,
    isSmallScreen,
    isExpanded,
    safeForWorkMode,
    onExpandPress,
    onYearRefreshPress,
    onSortPress: propOnSortPress,
  } = props;

  const {
    searchMonitoredMovies,
    monitorMovie,
    bulkMonitor,
    tableOptionChange,
    sortPress,
  } = usePerformerDetailsYearActions();

  function handleExpandPress() {
    onExpandPress(year, !isExpanded);
  }

  const totalMovieCount = movies.length;
  const monitoredMovieCount = movies.filter((m) => m.monitored).length;
  const movieFileCount = movies.filter(
    (m) => m.sizeOnDisk && m.sizeOnDisk > 0
  ).length;
  const sizeOnDisk = movies.reduce((total, movie) => {
    if (movie.sizeOnDisk) {
      return total + movie.sizeOnDisk;
    }
    return total;
  }, 0);

  // Sort movies by sortKey and sortDirection
  const moviesCopy = [...movies];
  moviesCopy.sort((a, b) => {
    const aValue = a[sortKey as keyof Movie] as string | number | undefined;
    const bValue = b[sortKey as keyof Movie] as string | number | undefined;
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    if (aValue < bValue) return sortDirection === ASCENDING ? -1 : 1;
    if (aValue > bValue) return sortDirection === ASCENDING ? 1 : -1;
    return 0;
  });
  const sortedMovies = moviesCopy;

  // Determine movie count background color
  function getMovieCountKind(
    monitored: boolean,
    movieFileCount: number,
    movieCount: number
  ) {
    if (movieFileCount === movieCount && movieCount > 0) {
      return kinds.SUCCESS;
    }
    if (!monitored) {
      return kinds.WARNING;
    }
    return kinds.DANGER;
  }

  function handleBulkMonitorPress() {
    bulkMonitor(movies);
  }

  function handleSearchPress() {
    searchMonitoredMovies(movies);
  }

  function handleRefreshClick() {
    if (onYearRefreshPress) {
      const ids = movies.map((m) => m.id);
      onYearRefreshPress(ids);
    }
  }

  function handleSortPress(name: string, direction?: SortDirection) {
    sortPress(
      name,
      direction ?? sortDirection,
      sortKey,
      sortDirection,
      propOnSortPress
    );
  }

  function handleMonitorMoviePress(movieId: number, monitored: boolean) {
    monitorMovie(movieId, monitored);
  }

  return (
    <div className={styles.year}>
      <div className={styles.header}>
        <div className={styles.hearerLeft}>
          <MonitorToggleButton
            className={styles.monitorToggleButton}
            monitored={movies.every((m: Movie) => m.monitored)}
            tooltip={translate('PerformerYearMonitorTooltip')}
            isSaving={false}
            size={24}
            onPress={handleBulkMonitorPress}
          />
          <span className={styles.yearNumber}>{year}</span>
          <Popover
            className={styles.movieCountTooltip}
            canFlip={true}
            anchor={
              <Label
                kind={getMovieCountKind(true, movieFileCount, totalMovieCount)}
                size={sizes.LARGE}
              >
                <span>
                  {movieFileCount} / {totalMovieCount}
                </span>
              </Label>
            }
            title={translate('SeasonInformation')}
            body={
              <div>
                <YearInfo
                  totalMovieCount={totalMovieCount}
                  monitoredMovieCount={monitoredMovieCount}
                  movieFileCount={movieFileCount}
                  sizeOnDisk={sizeOnDisk}
                />
              </div>
            }
            position={tooltipPositions.BOTTOM}
          />

          {sizeOnDisk ? (
            <div className={styles.sizeOnDisk}>{formatBytes(sizeOnDisk)}</div>
          ) : null}
        </div>

        <div className={styles.headerCenter}>
          <Link className={styles.expandButton} onPress={handleExpandPress}>
            <Icon
              className={styles.expandButtonIcon}
              name={isExpanded ? icons.COLLAPSE : icons.EXPAND}
              title={isExpanded ? translate('Hide') : translate('Show')}
              size={24}
            />
            {!isSmallScreen && <span>&nbsp;</span>}
          </Link>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.refreshButton}>
            <SpinnerIconButton
              className={styles.actionButton}
              name={icons.REFRESH}
              title={translate('Refresh')}
              size={24}
              isSpinning={false}
              isDisabled={false}
              onPress={handleRefreshClick}
            />
          </div>
          <div className={styles.searchButton}>
            <SpinnerIconButton
              className={styles.actionButton}
              name={icons.SEARCH}
              title={translate('Search')}
              size={24}
              isSpinning={false}
              isDisabled={false}
              onPress={handleSearchPress}
            />
          </div>
        </div>
      </div>
      <div>
        {isExpanded &&
          (sortedMovies && sortedMovies.length > 0 ? (
            <div>
              <Table
                columns={columns}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortPress={handleSortPress}
                onTableOptionChange={tableOptionChange}
              >
                <TableBody>
                  {sortedMovies.map((movie) => {
                    return (
                      <SceneRow
                        key={movie.id}
                        {...movie}
                        safeForWorkMode={safeForWorkMode}
                        columns={columns}
                        onMonitorMoviePress={handleMonitorMoviePress}
                      />
                    );
                  })}
                </TableBody>
              </Table>
              <div className={styles.footer}>
                <Link
                  className={styles.expandButton}
                  onPress={handleExpandPress}
                >
                  <Icon
                    className={styles.expandButton}
                    name={isExpanded ? icons.COLLAPSE : icons.EXPAND}
                    title={isExpanded ? translate('Hide') : translate('Show')}
                    size={24}
                  />
                </Link>
              </div>
            </div>
          ) : null)}
      </div>
    </div>
  );
}

export default PerformerDetailsYear;
