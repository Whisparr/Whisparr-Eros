import _ from 'lodash';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import Delayed from 'Components/Delayed';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import Measure from 'Components/Measure';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import type { CoverType, Image } from 'Movie/Movie';
import QualityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import DeleteStudioModalConnector from 'Studio/Delete/DeleteStudioModalConnector'; // Ensure .d.ts is present for TS typing
import EditStudioModalConnector from 'Studio/Edit/EditStudioModalConnector';
import StudioLogo from 'Studio/StudioLogo';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import StudioDetailsLinks from './StudioDetailsLinks';
import StudioDetailsYearConnector from './StudioDetailsYearConnector';
import StudioTagsConnector from './StudioTagsConnector';
import styles from './StudioDetails.css';

function getFanartUrl(images: Image[]): string | undefined {
  return _.find(images, { coverType: 'fanart' })?.url;
}

function ensureImageType(
  images: Array<{ coverType: string; url: string; remoteUrl?: string }>
): Image[] {
  // Convert images to Image[] with default remoteUrl and valid coverType
  return images.map((img) => ({
    coverType:
      img.coverType === 'poster' ||
      img.coverType === 'fanart' ||
      img.coverType === 'screenshot' ||
      img.coverType === 'clearlogo'
        ? (img.coverType as CoverType)
        : 'poster',
    url: img.url,
    remoteUrl: img.remoteUrl ?? '',
  }));
}

interface ExpandedState {
  allSelected: boolean;
  allUnselected: boolean;
  selectedState: { [year: number]: boolean };
}
function getExpandedState(newState: ExpandedState) {
  return {
    allExpanded: newState.allSelected,
    allCollapsed: newState.allUnselected,
    expandedState: newState.selectedState,
  };
}

interface StudioDetailsProps {
  id: number;
  foreignId: string;
  tmdbId?: number;
  tpdbId?: string;
  website?: string;
  title: string;
  aliases?: string[];
  network: string;
  rootFolderPath: string;
  sizeOnDisk: number;
  qualityProfileId: number;
  monitored: boolean;
  moviesMonitored: boolean;
  years: number[];
  genres: string[];
  images: Array<{ coverType: string; url: string }>;
  tags: number[];
  isSaving: boolean;
  isRefreshing: boolean;
  isSearching: boolean;
  isFetching: boolean;
  isPopulated: boolean;
  isSmallScreen: boolean;
  isSidebarVisible: boolean;
  previousStudio: object;
  nextStudio: object;
  onMonitorTogglePress: (
    value: boolean | { monitored: boolean; moviesMonitored: boolean },
    options: { shiftKey: boolean }
  ) => void;
  onRefreshPress: () => void;
  onSearchPress: () => void;
  onGoToStudio: () => void;
  moviesError?: object;
  hasMovies: boolean;
  hasScenes: boolean;
  movieCount: number;
  totalMovieCount: number;
  totalSceneCount: number;
  sceneCount: number;
  safeForWorkMode: boolean;
}

interface StudioDetailsState {
  isEditMovieModalOpen: boolean;
  isDeleteMovieModalOpen: boolean;
  allExpanded: boolean;
  allCollapsed: boolean;
  expandedState: { [year: number]: boolean };
  titleWidth: number;
}

class StudioDetails extends Component<StudioDetailsProps, StudioDetailsState> {
  state: StudioDetailsState = {
    isEditMovieModalOpen: false,
    isDeleteMovieModalOpen: false,
    allExpanded: false,
    allCollapsed: false,
    expandedState: {},
    titleWidth: 0,
  };

  // Listeners
  onDeleteMoviePress = () => {
    this.setState({ isDeleteMovieModalOpen: true });
  };

  onDeleteMovieModalClose = () => {
    this.setState({ isDeleteMovieModalOpen: false });
  };

  onEditMoviePress = () => {
    this.setState({ isEditMovieModalOpen: true });
  };

  onEditMovieModalClose = () => {
    this.setState({ isEditMovieModalOpen: false });
  };

  onTitleMeasure = ({ width }: { width: number }) => {
    this.setState({ titleWidth: width });
  };

  onExpandAllPress = () => {
    const { allExpanded, expandedState } = this.state;
    this.setState(getExpandedState(selectAll(expandedState, !allExpanded)));
  };

  onExpandPress = (year: number, isExpanded: boolean) => {
    this.setState((state) => {
      const convertedState = {
        allSelected: state.allExpanded,
        allUnselected: state.allCollapsed,
        selectedState: state.expandedState,
        lastToggled: null,
      };
      const newState = toggleSelected(
        convertedState,
        [],
        year,
        isExpanded,
        false
      );
      return getExpandedState(newState);
    });
  };

  // Updated handler for MonitorToggleButton
  onMonitorTogglePress = (
    value: boolean | { monitored: boolean; moviesMonitored: boolean },
    options: { shiftKey: boolean }
  ) => {
    if (typeof this.props.onMonitorTogglePress === 'function') {
      this.props.onMonitorTogglePress(value, options);
    }
  };
  // Render
  render() {
    const {
      id,
      foreignId,
      tmdbId,
      tpdbId,
      website,
      title,
      aliases = [],
      rootFolderPath,
      sizeOnDisk,
      qualityProfileId,
      monitored,
      moviesMonitored,
      years,
      genres = [],
      images,
      network,
      tags = [],
      isSaving,
      isRefreshing,
      isSearching,
      isFetching,
      isPopulated,
      isSmallScreen,
      hasMovies,
      hasScenes,
      movieCount,
      totalMovieCount,
      totalSceneCount,
      sceneCount,
      onRefreshPress,
      onSearchPress,
      moviesError,
      safeForWorkMode,
    } = this.props;
    const {
      isEditMovieModalOpen,
      isDeleteMovieModalOpen,
      expandedState,
      allExpanded,
      allCollapsed,
    } = this.state;

    let expandIcon = icons.EXPAND_INDETERMINATE;
    if (allExpanded) {
      expandIcon = icons.COLLAPSE;
    } else if (allCollapsed) {
      expandIcon = icons.EXPAND;
    }

    const runningYears = `${years[0]}-${years.slice(-1)}`;
    const imageList: Image[] = ensureImageType(
      images as Array<{ coverType: string; url: string; remoteUrl?: string }>
    );
    const fanartUrl = getFanartUrl(imageList);

    return (
      <PageContent title={title}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('RefreshAndScan')}
              iconName={icons.REFRESH}
              spinningName={icons.REFRESH}
              title={translate('RefreshInformationAndScanDisk')}
              isSpinning={isRefreshing}
              onPress={onRefreshPress}
            />

            <PageToolbarButton
              label={translate('SearchStudio')}
              iconName={icons.SEARCH}
              isSpinning={isSearching}
              title={undefined}
              onPress={onSearchPress}
            />

            <PageToolbarSeparator />

            <PageToolbarButton
              label={translate('Edit')}
              iconName={icons.EDIT}
              onPress={this.onEditMoviePress}
            />

            <PageToolbarButton
              label={translate('Delete')}
              iconName={icons.DELETE}
              onPress={this.onDeleteMoviePress}
            />
          </PageToolbarSection>

          <PageToolbarSection alignContent="right">
            <PageToolbarButton
              label={allExpanded ? 'Collapse All' : 'Expand All'}
              iconName={expandIcon}
              onPress={this.onExpandAllPress}
            />
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody innerClassName={styles.innerContentBody}>
          <div className={styles.header}>
            <div
              className={styles.backdrop}
              style={
                fanartUrl ? { backgroundImage: `url(${fanartUrl})` } : undefined
              }
            >
              <div className={styles.backdropOverlay} />
            </div>

            <div className={styles.headerContent}>
              <StudioLogo
                safeForWorkMode={safeForWorkMode}
                className={styles.poster}
                images={imageList}
                size={250}
                lazy={false}
              />
              <div className={styles.info}>
                <Measure onMeasure={this.onTitleMeasure}>
                  <div className={styles.titleRow}>
                    <div className={styles.titleContainer}>
                      <div className={styles.monitorToggleButtonsContainer}>
                        <div className={styles.toggleMonitoredContainer}>
                          <MonitorToggleButton
                            className={
                              monitored
                                ? styles.monitorToggleButton
                                : `${styles.monitorToggleButton} ${styles.unmonitored}`
                            }
                            monitored={monitored}
                            moviesMonitored={moviesMonitored}
                            type="sceneMonitor"
                            isSaving={isSaving}
                            size={30}
                            onPress={this.onMonitorTogglePress}
                          />
                        </div>

                        {(this.props.tpdbId ||
                          (typeof tmdbId === 'number' && tmdbId > 0)) && (
                          <div
                            className={styles.toggleMoviesMonitoredContainer}
                          >
                            <MonitorToggleButton
                              className={
                                moviesMonitored
                                  ? styles.monitorToggleButton
                                  : `${styles.monitorToggleButton} ${styles.unmonitored}`
                              }
                              monitored={monitored}
                              moviesMonitored={moviesMonitored}
                              type="movieMonitor"
                              isSaving={isSaving}
                              size={30}
                              onPress={this.onMonitorTogglePress}
                            />
                          </div>
                        )}
                      </div>

                      <div className={styles.title}>{title}</div>
                    </div>
                  </div>
                </Measure>

                <div className={styles.details}>
                  <div>
                    <span className={styles.years}>{runningYears}</span>

                    <span className={styles.network}>{network}</span>

                    <span className={styles.links}>
                      <Tooltip
                        anchor={<Icon name={icons.EXTERNAL_LINK} size={20} />}
                        tooltip={
                          <StudioDetailsLinks
                            foreignId={foreignId}
                            website={website}
                            tmdbId={tmdbId}
                            tpdbId={tpdbId}
                          />
                        }
                        position={tooltipPositions.BOTTOM}
                      />
                    </span>

                    {!!tags.length && (
                      <span>
                        <Tooltip
                          anchor={<Icon name={icons.TAGS} size={20} />}
                          tooltip={<StudioTagsConnector studioId={id} />}
                          position={tooltipPositions.BOTTOM}
                        />
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className={styles.detailsLabel} size={sizes.LARGE}>
                    <Icon name={icons.FOLDER} size={17} />

                    <span className={styles.path}>{rootFolderPath}</span>
                  </Label>

                  <Label
                    className={styles.detailsLabel}
                    title={translate('QualityProfile')}
                    size={sizes.LARGE}
                  >
                    <Icon name={icons.PROFILE} size={17} />

                    <span className={styles.qualityProfileName}>
                      <QualityProfileName qualityProfileId={qualityProfileId} />
                    </span>
                  </Label>

                  <Label className={styles.detailsLabel} size={sizes.LARGE}>
                    <Icon name={icons.FILM} size={17} />

                    <span className={styles.movieCount}>
                      Movies: {movieCount || 0}/{totalMovieCount}
                    </span>
                  </Label>

                  <Label className={styles.detailsLabel} size={sizes.LARGE}>
                    <Icon name={icons.SCENE} size={17} />

                    <span className={styles.sceneCount}>
                      Scenes: {sceneCount || 0}/{totalSceneCount}
                    </span>
                  </Label>

                  <Tooltip
                    anchor={
                      <Label className={styles.detailsLabel} size={sizes.LARGE}>
                        <Icon name={icons.DRIVE} size={17} />

                        <span className={styles.sizeOnDisk}>
                          {formatBytes(sizeOnDisk || 0)}
                        </span>
                      </Label>
                    }
                    tooltip={<span>{null}</span>}
                    kind={kinds.INVERSE}
                    position={tooltipPositions.BOTTOM}
                  />

                  {!!genres.length && !isSmallScreen && (
                    <Label
                      className={styles.detailsLabel}
                      title={translate('Genres')}
                      size={sizes.LARGE}
                    >
                      <span className={styles.genres}>{genres.join(', ')}</span>
                    </Label>
                  )}

                  {!!aliases && !!aliases.length && (
                    <Label
                      className={styles.detailsLabel}
                      title={translate('Aliases')}
                      size={sizes.LARGE}
                    >
                      <Icon name={icons.TAGS} size={17} />

                      <span className={styles.aliases}>
                        {aliases.join(', ')}
                      </span>
                    </Label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contentContainer}>
            {!isFetching && moviesError ? (
              <Alert kind={kinds.DANGER}>
                {translate('LoadingMoviesFailed')}
              </Alert>
            ) : null}

            {!isFetching && isPopulated && hasMovies ? (
              <FieldSet legend={translate('Movies')}>
                {isPopulated && !!years.length && (
                  <div>
                    {years
                      .slice(0)
                      .reverse()
                      .map((year) => (
                        <Delayed key={year} waitBeforeShow={50}>
                          <StudioDetailsYearConnector
                            key={year}
                            studioId={id}
                            studioForeignId={foreignId}
                            year={year}
                            isScenes={false}
                            isExpanded={expandedState[year]}
                            onExpandPress={this.onExpandPress}
                          />
                        </Delayed>
                      ))}
                  </div>
                )}
              </FieldSet>
            ) : null}

            {!isFetching && isPopulated && hasScenes ? (
              <FieldSet legend={translate('Scenes')}>
                {isPopulated && !!years.length && (
                  <div>
                    {years
                      .slice(0)
                      .reverse()
                      .map((year) => (
                        <Delayed key={year} waitBeforeShow={50}>
                          <StudioDetailsYearConnector
                            key={year}
                            studioId={id}
                            studioForeignId={foreignId}
                            year={year}
                            isScenes={true}
                            isExpanded={expandedState[year]}
                            onExpandPress={this.onExpandPress}
                          />
                        </Delayed>
                      ))}
                  </div>
                )}
              </FieldSet>
            ) : null}
          </div>

          <EditStudioModalConnector
            isOpen={isEditMovieModalOpen}
            studioId={id}
            onModalClose={this.onEditMovieModalClose}
          />

          <DeleteStudioModalConnector
            isOpen={isDeleteMovieModalOpen}
            studioId={id}
            onModalClose={this.onDeleteMovieModalClose}
            onDeleteMoviePress={this.onDeleteMoviePress}
          />
        </PageContentBody>
      </PageContent>
    );
  }
}

export default StudioDetails;
