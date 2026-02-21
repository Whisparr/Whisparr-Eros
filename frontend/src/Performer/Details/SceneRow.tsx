import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'Components/Icon';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Column from 'Components/Table/Column';
import TableRow from 'Components/Table/TableRow';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, tooltipPositions } from 'Helpers/Props';
import MovieIndexProgressBar from 'Movie/Index/ProgressBar/MovieIndexProgressBar';
import { MovieStatus } from 'Movie/Movie';
import MovieFormats from 'Movie/MovieFormats';
import MovieSearchCell from 'Movie/MovieSearchCell';
import MovieTitleLink from 'Movie/MovieTitleLink';
import MediaInfo from 'MovieFile/Editor/MediaInfo';
import { MovieFile } from 'MovieFile/MovieFile';
import MovieFileLanguageConnector from 'MovieFile/MovieFileLanguages';
import type { default as CustomFormatType } from 'typings/CustomFormat';
import formatRuntime from 'Utilities/Date/formatRuntime';
import formatBytes from 'Utilities/Number/formatBytes';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import translate from 'Utilities/String/translate';
import styles from './SceneRow.css';

interface SceneRowProps {
  id: number;
  itemType: string;
  foreignId: string;
  movieFileId?: number;
  isAvailable: boolean;
  hasFile: boolean;
  movieFile?: MovieFile;
  monitored: boolean;
  languages?: string[];
  audioLanguages?: string[];
  performerNames?: string[];
  joinedPerformers?: string;
  releaseDate?: string;
  runtime?: number;
  movieRuntimeFormat?: string;
  title: string;
  titleSlug: string;
  isSaving?: boolean;
  path?: string;
  relativePath?: string;
  movieFilePath?: string;
  movieFileRelativePath?: string;
  sizeOnDisk?: number;
  releaseGroup?: string;
  rootFolderPath?: string;
  status: MovieStatus;
  safeForWorkMode?: boolean;
  studioTitle?: string;
  studioForeignId?: string;
  customFormats?: CustomFormatType[];
  customFormatScore?: number;
  mediaInfo?: ReturnType<typeof MediaInfo>;
  columns: Column[];
  onMonitorMoviePress: (
    id: number,
    monitored: boolean,
    options?: object
  ) => void;
}

interface SceneRowState {
  isDetailsModalOpen: boolean;
}

class SceneRow extends Component<SceneRowProps, SceneRowState> {
  constructor(props: SceneRowProps, context?: object) {
    super(props, context);
    this.state = {
      isDetailsModalOpen: false,
    };
  }

  onManualSearchPress = (): void => {
    this.setState({ isDetailsModalOpen: true });
  };

  onDetailsModalClose = (): void => {
    this.setState({ isDetailsModalOpen: false });
  };

  onMonitorToggle = (): void => {
    const { id, monitored, onMonitorMoviePress } = this.props;
    onMonitorMoviePress(id, !monitored);
  };

  render() {
    const {
      id,
      itemType,
      foreignId,
      movieFileId,
      monitored,
      performerNames,
      runtime,
      path,
      relativePath,
      languages,
      audioLanguages,
      isAvailable,
      hasFile,
      movieFile,
      movieRuntimeFormat,
      releaseDate,
      title,
      titleSlug,
      isSaving,
      studioTitle,
      studioForeignId,
      sizeOnDisk,
      releaseGroup,
      customFormats = [],
      customFormatScore,
      columns,
    } = this.props;

    const status = this.props.status as MovieStatus;
    const externalLink = () => {
      if (!foreignId) return '';
      if (foreignId.startsWith('tpdbId:')) {
        return `https://www.theporndb.net/movies/${foreignId.replace(
          'tpdbId:',
          ''
        )}`;
      }
      if (parseInt(foreignId) > 0) {
        return `https://www.themoviedb.org/movie/${foreignId.replace(
          'tmdbId:',
          ''
        )}`;
      }
      // failsafe, though we shouldn't ever need this
      return `https://stashdb.org/scene/${foreignId}`;
    };

    const url = externalLink();
    return (
      <TableRow>
        {columns.map((column) => {
          const { name, isVisible } = column;
          if (!isVisible) return null;

          if (name === 'monitored') {
            return (
              <TableRowCell key={name} className={styles.monitored}>
                <MonitorToggleButton
                  className={styles.monitorToggleButton}
                  size={20}
                  type={itemType === 'scene' ? 'sceneMonitor' : 'movieMonitor'}
                  monitored={monitored}
                  moviesMonitored={monitored}
                  isSaving={isSaving}
                  isDisabled={false}
                  onPress={this.onMonitorToggle}
                />
              </TableRowCell>
            );
          }

          if (name === 'title') {
            return (
              <TableRowCell key={name} className={styles.title}>
                <MovieTitleLink titleSlug={titleSlug} title={title} />
              </TableRowCell>
            );
          }

          // Fully populated Studio will link to it, otherwise just show name
          if (name === 'studioTitle') {
            return (
              <TableRowCell key={name} className={styles.studio}>
                {studioForeignId ? (
                  <Link to={`/studio/${studioForeignId}`}>{studioTitle}</Link>
                ) : (
                  <Tooltip
                    anchor={
                      <span>
                        {studioTitle}
                        <a href={url} target="_blank">
                          <Icon
                            className={styles.externalLink}
                            name={icons.EXTERNAL_LINK}
                          />
                        </a>
                      </span>
                    }
                    tooltip={translate('StudioNotInStashDb')}
                  />
                )}
              </TableRowCell>
            );
          }

          if (name === 'releaseDate') {
            return <RelativeDateCell key={name} date={releaseDate} />;
          }

          if (name === 'credits' && performerNames) {
            // TODO: Workaround for duplicates before slicing
            const uniquePerformers = Array.from(new Set(performerNames));
            const joinedPerformers = uniquePerformers
              .sort((a, b) => (a > b ? 1 : -1))
              .slice(0, 4)
              .join(', ');
            return (
              <TableRowCell key={name} className={styles.performers}>
                <span title={joinedPerformers}>{joinedPerformers}</span>
              </TableRowCell>
            );
          }

          if (name === 'runtime') {
            return (
              <TableRowCell key={name} className={styles.runtime}>
                {typeof runtime === 'number'
                  ? formatRuntime(runtime, movieRuntimeFormat)
                  : null}
              </TableRowCell>
            );
          }

          if (name === 'customFormats') {
            return customFormats.length > 0 ? (
              <TableRowCell key={name}>
                <MovieFormats formats={customFormats as CustomFormatType[]} />
              </TableRowCell>
            ) : null;
          }

          if (name === 'customFormatScore') {
            return (
              <TableRowCell key={name} className={styles.customFormatScore}>
                <Tooltip
                  anchor={formatCustomFormatScore(
                    customFormatScore,
                    customFormats ? customFormats.length : 0
                  )}
                  tooltip={
                    <MovieFormats
                      formats={customFormats as CustomFormatType[]}
                    />
                  }
                  position={tooltipPositions.BOTTOM}
                />
              </TableRowCell>
            );
          }

          if (name === 'languages') {
            return languages && languages.length > 0 ? (
              <TableRowCell key={name} className={styles.languages}>
                {typeof movieFileId === 'number' ? (
                  <MovieFileLanguageConnector movieFileId={movieFileId} />
                ) : null}
              </TableRowCell>
            ) : null;
          }

          if (name === 'audioLanguages') {
            return audioLanguages && audioLanguages.length > 0 ? (
              <TableRowCell key={name} className={styles.audio}>
                {typeof movieFileId === 'number' ? (
                  <MovieFileLanguageConnector movieFileId={movieFileId} />
                ) : null}
              </TableRowCell>
            ) : null;
          }

          if (name === 'audioInfo') {
            return (
              <TableRowCell key={name} className={styles.audio}>
                {movieFile && movieFile.mediaInfo ? (
                  <MediaInfo {...movieFile.mediaInfo} />
                ) : null}
              </TableRowCell>
            );
          }

          if (name === 'audioLanguages') {
            return (
              <TableRowCell key={name} className={styles.audioLanguages}>
                {movieFile && movieFile.mediaInfo ? (
                  <MediaInfo {...movieFile.mediaInfo} />
                ) : null}
              </TableRowCell>
            );
          }

          if (name === 'subtitleLanguages') {
            return (
              <TableRowCell key={name} className={styles.subtitles}>
                {movieFile && movieFile.mediaInfo ? (
                  <MediaInfo {...movieFile.mediaInfo} />
                ) : null}
              </TableRowCell>
            );
          }

          if (name === 'videoCodec') {
            return (
              <TableRowCell key={name} className={styles.video}>
                {movieFile && movieFile.mediaInfo ? (
                  <MediaInfo {...movieFile.mediaInfo} />
                ) : null}
              </TableRowCell>
            );
          }

          if (name === 'videoDynamicRangeType') {
            return (
              <TableRowCell key={name} className={styles.videoDynamicRangeType}>
                {movieFile && movieFile.mediaInfo ? (
                  <MediaInfo {...movieFile.mediaInfo} />
                ) : null}
              </TableRowCell>
            );
          }

          if (name === 'path') {
            return path ? (
              <TableRowCell
                key={name}
                className={
                  this.props.safeForWorkMode ? styles.blurred : styles.path
                }
              >
                {path}
              </TableRowCell>
            ) : null;
          }

          if (name === 'relativePath') {
            return relativePath ? (
              <TableRowCell key={name} className={styles.relativePath}>
                {relativePath}
              </TableRowCell>
            ) : null;
          }

          if (name === 'sizeOnDisk') {
            return (
              <TableRowCell key={name} className={styles.size}>
                {sizeOnDisk ? formatBytes(sizeOnDisk) : null}
              </TableRowCell>
            );
          }

          if (name === 'releaseGroup') {
            return (
              <TableRowCell key={name} className={styles.releaseGroup}>
                {releaseGroup ? releaseGroup : null}
              </TableRowCell>
            );
          }

          if (name === 'status') {
            return (
              <TableRowCell key={name} className={styles.status}>
                <MovieIndexProgressBar
                  movieId={id}
                  isAvailable={isAvailable}
                  hasFile={hasFile}
                  movieFile={movieFile}
                  monitored={monitored}
                  detailedProgressBar={true}
                  bottomRadius={false}
                  isStandAlone={true}
                  status={status}
                  width={100}
                />
              </TableRowCell>
            );
          }

          if (name === 'actions') {
            return <MovieSearchCell key={name} movieId={id} />;
          }

          return null;
        })}
      </TableRow>
    );
  }
}

export default SceneRow;
