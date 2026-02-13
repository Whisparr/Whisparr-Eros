import _ from 'lodash';
import React from 'react';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import Menu from 'Components/Menu/Menu';
import MenuButton from 'Components/Menu/MenuButton';
import MenuContent from 'Components/Menu/MenuContent';
import MenuItem from 'Components/Menu/MenuItem';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import SpinnerIcon from 'Components/SpinnerIcon';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import Popover from 'Components/Tooltip/Popover';
import { align, icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import SceneRow from 'Performer/Details/SceneRow';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import {
  useStudioDetailsYearActions,
  useStudioDetailsYearData,
} from './useStudioDetailsYear';
import YearInfo from './YearInfo';
import styles from './StudioDetailsYear.css';

interface StudioDetailsYearProps {
  studioId: number;
  year: number;
  works: Movie[];
  safeForWorkMode?: boolean;
  isExpanded?: boolean;
  onExpandPress: (year: number, expand: boolean) => void;
  onYearRefreshPress?: (ids: number[]) => void;
}

function getYearStatistics(movies: Movie[]) {
  let movieCount = 0;
  let movieFileCount = 0;
  let totalMovieCount = 0;
  let monitoredMovieCount = 0;
  let hasMonitoredMovies = false;

  movies.forEach((movie) => {
    if (movie.movieFile || (movie.monitored && movie.isAvailable)) {
      movieCount++;
    }

    if (movie.movieFile) {
      movieFileCount++;
    }

    if (movie.monitored) {
      monitoredMovieCount++;
      hasMonitoredMovies = true;
    }

    totalMovieCount++;
  });

  return {
    movieCount,
    movieFileCount,
    totalMovieCount,
    monitoredMovieCount,
    hasMonitoredMovies,
  };
}

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

function StudioDetailsYear(props: StudioDetailsYearProps) {
  const {
    studioId,
    year,
    works,
    safeForWorkMode,
    isExpanded,
    onExpandPress,
    onYearRefreshPress,
  } = props;

  const {
    items,
    studioMonitored,
    isSmallScreen,
    isSearching,
    columns,
    sortKey,
    sortDirection,
  } = useStudioDetailsYearData(studioId, works);

  const {
    onMonitorYearPress,
    onMonitorMoviePress,
    onTableOptionChange,
    onSortPress,
    onSearchPress,
  } = useStudioDetailsYearActions(studioId, year, items);

  function handleExpandPress() {
    onExpandPress(year, !isExpanded);
  }

  function handleRefreshPress() {
    if (!onYearRefreshPress) return;
    const ids = items.map((item) => item.id);
    onYearRefreshPress(ids);
  }

  function handleMonitorMoviePress(
    id: number,
    monitored: boolean,
    options?: object
  ) {
    const shiftKey =
      options && typeof options === 'object' && 'shiftKey' in options
        ? Boolean(options.shiftKey)
        : false;
    onMonitorMoviePress(id, monitored, { shiftKey });
  }

  function handleSortPress(name: string, direction?: SortDirection) {
    onSortPress(name, direction, sortKey, sortDirection);
  }

  if (items.length === 0) {
    return null;
  }

  const {
    movieCount,
    movieFileCount,
    totalMovieCount,
    monitoredMovieCount,
    hasMonitoredMovies,
  } = getYearStatistics(items);

  const sizeOnDisk = _.sumBy(items, 'sizeOnDisk');

  return (
    <div className={styles.season}>
      <div className={styles.header}>
        <div className={styles.left}>
          <MonitorToggleButton
            monitored={monitoredMovieCount === totalMovieCount}
            size={24}
            onPress={onMonitorYearPress}
          />
          <span className={styles.seasonNumber}>{year}</span>
          <Popover
            className={styles.movieCountTooltip}
            canFlip={true}
            anchor={
              <Label
                kind={getMovieCountKind(
                  studioMonitored,
                  movieFileCount,
                  movieCount
                )}
                size={sizes.LARGE}
              >
                <span>
                  {movieFileCount} / {movieCount}
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
        <Link className={styles.expandButton} onPress={handleExpandPress}>
          <Icon
            className={styles.expandButtonIcon}
            name={isExpanded ? icons.COLLAPSE : icons.EXPAND}
            title={
              isExpanded ? translate('HideMovies') : translate('ShowMovies')
            }
            size={24}
          />
          {!isSmallScreen && <span>&nbsp;</span>}
        </Link>
        {isSmallScreen ? (
          <Menu
            className={styles.actionsMenu}
            alignMenu={align.RIGHT}
            enforceMaxHeight={false}
          >
            <MenuButton>
              <Icon name={icons.ACTIONS} size={22} />
            </MenuButton>
            <MenuContent className={styles.actionsMenuContent}>
              <MenuItem onPress={handleRefreshPress}>
                <Icon className={styles.actionMenuIcon} name={icons.REFRESH} />
                {translate('Refresh')}
              </MenuItem>
              <MenuItem
                isDisabled={
                  isSearching || !hasMonitoredMovies || !studioMonitored
                }
                onPress={onSearchPress}
              >
                <SpinnerIcon
                  className={styles.actionMenuIcon}
                  name={icons.SEARCH}
                  isSpinning={isSearching}
                />
                {translate('Search')}
              </MenuItem>
            </MenuContent>
          </Menu>
        ) : (
          <div className={styles.actions}>
            <SpinnerIconButton
              className={styles.actionButton}
              name={icons.REFRESH}
              title={translate('Refresh')}
              size={24}
              isSpinning={false}
              isDisabled={false}
              onPress={handleRefreshPress}
            />
            <SpinnerIconButton
              className={styles.actionButton}
              name={icons.SEARCH}
              title={
                hasMonitoredMovies && studioMonitored
                  ? translate('SearchForMonitoredMoviesYear')
                  : translate('NoMonitoredMoviesYear')
              }
              size={24}
              isSpinning={isSearching}
              isDisabled={
                isSearching || !hasMonitoredMovies || !studioMonitored
              }
              onPress={onSearchPress}
            />
          </div>
        )}
      </div>
      <div>
        {isExpanded && (
          <div
            className={
              'movies' in styles ? (styles.movies as string) : undefined
            }
          >
            {items.length ? (
              <Table
                columns={columns}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortPress={handleSortPress}
                onTableOptionChange={onTableOptionChange}
              >
                <TableBody>
                  {items.map((item: Movie) => (
                    <SceneRow
                      key={item.id}
                      columns={columns}
                      {...item}
                      safeForWorkMode={safeForWorkMode}
                      onMonitorMoviePress={handleMonitorMoviePress}
                    />
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div
                className={
                  'noMovies' in styles ? (styles.noMovies as string) : undefined
                }
              >
                {translate('NoMoviesInThisSeason')}
              </div>
            )}
            <div className={styles.collapseButtonContainer}>
              <IconButton
                iconClassName={styles.collapseButtonIcon}
                name={icons.COLLAPSE}
                size={20}
                title={translate('HideMovies')}
                onPress={handleExpandPress}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudioDetailsYear;
