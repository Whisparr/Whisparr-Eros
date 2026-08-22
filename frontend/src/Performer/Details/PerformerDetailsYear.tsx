import React from 'react';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import Popover from 'Components/Tooltip/Popover';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import YearInfo from 'Studio/Details/YearInfo';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import SceneRow from './SceneRow';
import {
  usePerformerDetailsYearActions,
  usePerformerDetailsYearData,
} from './usePerformerDetailsYear';
import styles from './PerformerDetailsYear.css';

interface PerformerDetailsYearProps {
  year: number;
  movies: Movie[];
  isExpanded?: boolean;
  onYearRefreshPress?: (ids: number[]) => void;
  onExpandPress: (year: number, expand: boolean) => void;
}

function PerformerDetailsYear(props: PerformerDetailsYearProps) {
  const { movies, year, isExpanded, onExpandPress, onYearRefreshPress } = props;

  const {
    items: sortedMovies,
    isSmallScreen,
    columns,
    sortKey,
    sortDirection,
  } = usePerformerDetailsYearData(movies);

  const {
    onMonitorYearPress,
    onTableOptionChange,
    onSortPress,
    onSearchPress,
  } = usePerformerDetailsYearActions(movies);

  function handleExpandPress() {
    onExpandPress(year, !isExpanded);
  }

  const totalMovieCount = movies.length;
  const monitoredMovieCount = movies.filter((m) => m.monitored).length;
  const movieFileCount = movies.filter(
    (m) => m.sizeOnDisk && m.sizeOnDisk > 0
  ).length;
  const missingMonitored = movies.some((m) => m.monitored && !m.movieFileId);
  const sizeOnDisk = movies.reduce((total, movie) => {
    if (movie.sizeOnDisk) {
      return total + movie.sizeOnDisk;
    }
    return total;
  }, 0);

  // Determine movie count background color
  function getMovieCountKind() {
    switch (true) {
      case missingMonitored:
        return kinds.DANGER;
      case movieFileCount !== totalMovieCount &&
        !missingMonitored &&
        monitoredMovieCount > 0:
        return kinds.WARNING;
      case movieFileCount !== totalMovieCount &&
        !missingMonitored &&
        monitoredMovieCount === 0:
        return kinds.DEFAULT;
      case movieFileCount === totalMovieCount:
        return kinds.SUCCESS;
      default:
        return kinds.DANGER;
    }
  }
  const yearKind = getMovieCountKind();

  function handleRefreshClick() {
    if (onYearRefreshPress) {
      const ids = movies.map((m) => m.id);
      onYearRefreshPress(ids);
    }
  }

  function handleSortPress(name: string, direction?: SortDirection) {
    onSortPress(name, direction, sortKey, sortDirection);
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
            onPress={onMonitorYearPress}
          />
          <span className={styles.yearNumber}>{year}</span>
          <Popover
            className={styles.movieCountTooltip}
            canFlip={true}
            anchor={
              <Label kind={yearKind} size={sizes.LARGE}>
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
              onPress={onSearchPress}
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
                onTableOptionChange={onTableOptionChange}
              >
                <TableBody>
                  {sortedMovies.map((movie) => {
                    return (
                      <SceneRow
                        key={movie.id}
                        movie={movie}
                        columns={columns}
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
