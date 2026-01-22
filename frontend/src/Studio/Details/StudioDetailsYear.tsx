import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';
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
import { MovieFile } from 'MovieFile/MovieFile';
import { bulkMonitorMovie } from 'Store/Actions/movieActions';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import SceneRowConnector from './SceneRowConnector';
import YearInfo from './YearInfo';
import styles from './StudioDetailsYear.css';

interface Movie {
  id: number;
  monitored: boolean;
  isAvailable?: boolean;
  movieFile?: MovieFile;
  sizeOnDisk?: number;
  // Add additional known properties here if needed
}

import Column from 'Components/Table/Column';

interface StudioDetailsYearProps {
  studioId: number;
  year: number;
  items: Movie[];
  columns: Column[];
  sortKey: string;
  sortDirection: string;
  isSaving?: boolean;
  isExpanded?: boolean;
  isSearching: boolean;
  isScenes?: boolean;
  studioMonitored: boolean;
  isSmallScreen: boolean;
  onTableOptionChange: (...args: unknown[]) => void;
  onSortPress: (...args: unknown[]) => void;
  onExpandPress: (year: number, expand: boolean) => void;
  onMonitorMoviePress: (
    movieId: number,
    monitored: boolean,
    event: { shiftKey: boolean }
  ) => void;
  onSearchPress: (...args: unknown[]) => void;
  bulkMonitorMovie: (args: { ids: number[]; monitored: boolean }) => void;
}

function getYearStatistics(movies: Movie[]) {
  let movieCount = 0;
  let movieFileCount = 0;
  let totalMovieCount = 0;
  let monitoredMovieCount = 0;
  let hasMonitoredMovies = false;
  // sizeOnDisk is calculated separately

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

interface StudioDetailsYearState {
  isOrganizeModalOpen: boolean;
  isManageMoviesOpen: boolean;
  isHistoryModalOpen: boolean;
  lastToggledMovie: number | null;
}

class StudioDetailsYear extends Component<
  StudioDetailsYearProps,
  StudioDetailsYearState
> {
  state: StudioDetailsYearState = {
    isOrganizeModalOpen: false,
    isManageMoviesOpen: false,
    isHistoryModalOpen: false,
    lastToggledMovie: null,
  };

  componentDidMount() {
    this._expandByDefault();
  }

  componentDidUpdate(prevProps: StudioDetailsYearProps) {
    const { studioId, items } = this.props;

    if (prevProps.studioId !== studioId) {
      this._expandByDefault();
      return;
    }

    if (
      getYearStatistics(prevProps.items).movieFileCount > 0 &&
      getYearStatistics(items).movieFileCount === 0
    ) {
      this.setState({
        isOrganizeModalOpen: false,
        isManageMoviesOpen: false,
      });
    }
  }

  _expandByDefault() {
    const { year, onExpandPress, items } = this.props;
    const expand = year === moment().year() && items.length < 60;
    onExpandPress(year, expand);
  }

  onExpandPress = () => {
    const { year, isExpanded } = this.props;
    this.props.onExpandPress(year, !isExpanded);
  };

  onMonitorYearPress = () => {
    const { items } = this.props;
    const allMonitored = items.every((movie) => movie.monitored);
    const newMonitoredState = !allMonitored;
    const ids = items.map((item) => item.id);
    this.props.bulkMonitorMovie({ ids, monitored: newMonitoredState });
  };

  onMonitorMoviePress = (
    movieId: number,
    monitored: boolean,
    event: { shiftKey: boolean }
  ) => {
    this.setState({ lastToggledMovie: movieId });
    this.props.onMonitorMoviePress(movieId, monitored, event);
  };

  render() {
    const {
      year,
      items,
      isExpanded,
      isSearching,
      studioMonitored,
      isSmallScreen,
      onSearchPress,
      columns,
      sortKey,
      onSortPress,
      onTableOptionChange,
    } = this.props;

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

    // ...existing code...
    return (
      <div className={styles.season}>
        <div className={styles.header}>
          <div className={styles.left}>
            <MonitorToggleButton
              monitored={monitoredMovieCount === totalMovieCount}
              size={24}
              onPress={this.onMonitorYearPress}
            />
            <span className={styles.seasonNumber}>{year}</span>
            <Popover
              className={styles.movieCountTooltip}
              canFlip={true}
              anchor={
                <Label
                  kind={getMovieCountKind(true, movieFileCount, movieCount)}
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
          <Link className={styles.expandButton} onPress={this.onExpandPress}>
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
                name={icons.SEARCH}
                title={
                  hasMonitoredMovies && studioMonitored
                    ? translate('SearchForMonitoredMoviesSeason')
                    : translate('NoMonitoredMoviesSeason')
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
                  onSortPress={onSortPress}
                  onTableOptionChange={onTableOptionChange}
                >
                  <TableBody>
                    {items.map((item) => (
                      <SceneRowConnector
                        key={item.id}
                        columns={columns}
                        {...item}
                        onMonitorMoviePress={this.onMonitorMoviePress}
                      />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div
                  className={
                    'noMovies' in styles
                      ? (styles.noMovies as string)
                      : undefined
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
                  onPress={this.onExpandPress}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(null, { bulkMonitorMovie })(StudioDetailsYear);
