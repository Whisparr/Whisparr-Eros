import React, { Component } from 'react';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import Tooltip from 'Components/Tooltip/Tooltip';
import { tooltipPositions } from 'Helpers/Props';
import MovieIndexProgressBar from 'Movie/Index/ProgressBar/MovieIndexProgressBar';
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
import styles from './SceneRow.css';

interface Credit {
  performer: {
    name: string;
  };
}

interface Column {
  name: string;
  isVisible: boolean;
}

interface SceneRowProps {
  id: number;
  foreignId: string;
  movieFileId?: number;
  isAvailable: boolean;
  hasFile: boolean;
  movieFile?: MovieFile;
  monitored: boolean;
  credits?: Credit[];
  joinedPerformers?: string;
  releaseDate?: string;
  runtime?: number;
  movieRuntimeFormat?: string;
  title: string;
  isSaving?: boolean;
  movieFilePath?: string;
  movieFileRelativePath?: string;
  movieFileSize?: number;
  releaseGroup?: string;
  customFormats?: CustomFormatType[];
  customFormatScore: number;
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

  onMonitorMoviePress = (monitored: boolean, options?: object): void => {
    this.props.onMonitorMoviePress(this.props.id, monitored, options);
  };

  render() {
    const {
      id,
      foreignId,
      movieFileId,
      monitored,
      credits = [],
      runtime,
      isAvailable,
      hasFile,
      movieFile,
      movieRuntimeFormat,
      releaseDate,
      title,
      isSaving,
      movieFilePath,
      movieFileRelativePath,
      movieFileSize,
      releaseGroup,
      customFormats = [],
      customFormatScore,
      columns,
    } = this.props;

    return (
      <TableRow>
        {columns.map((column) => {
          const { name, isVisible } = column;
          if (!isVisible) return null;

          if (name === 'monitored') {
            return (
              <TableRowCell key={name} className={styles.monitored}>
                <MonitorToggleButton
                  monitored={monitored}
                  isSaving={isSaving}
                  onPress={this.onMonitorMoviePress}
                />
              </TableRowCell>
            );
          }

          if (name === 'title') {
            return (
              <TableRowCell key={name} className={styles.title}>
                <MovieTitleLink foreignId={foreignId} title={title} />
              </TableRowCell>
            );
          }

          if (name === 'credits') {
            const joinedPerformers = credits
              .slice(0, 4)
              .sort((a, b) => (a.performer.name > b.performer.name ? 1 : -1))
              .map((credit) => credit.performer.name)
              .join(', ');
            return (
              <TableRowCell key={name} className={styles.performers}>
                <span title={joinedPerformers}>{joinedPerformers}</span>
              </TableRowCell>
            );
          }

          if (name === 'path') {
            return <TableRowCell key={name}>{movieFilePath}</TableRowCell>;
          }

          if (name === 'relativePath') {
            return (
              <TableRowCell key={name}>{movieFileRelativePath}</TableRowCell>
            );
          }

          if (name === 'releaseDate') {
            return <RelativeDateCell key={name} date={releaseDate} />;
          }

          if (name === 'runtime') {
            return (
              <TableRowCell key={name} className={styles.runtime}>
                {typeof runtime === 'number'
                  ? formatRuntime(runtime, movieRuntimeFormat)
                  : ''}
              </TableRowCell>
            );
          }

          if (name === 'customFormats') {
            return (
              <TableRowCell key={name}>
                <MovieFormats formats={customFormats as CustomFormatType[]} />
              </TableRowCell>
            );
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
            return (
              <TableRowCell key={name} className={styles.languages}>
                {typeof movieFileId === 'number' ? (
                  <MovieFileLanguageConnector movieFileId={movieFileId} />
                ) : null}
              </TableRowCell>
            );
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

          if (name === 'size') {
            return (
              <TableRowCell key={name} className={styles.size}>
                {!!movieFileSize && formatBytes(movieFileSize)}
              </TableRowCell>
            );
          }

          if (name === 'releaseGroup') {
            return (
              <TableRowCell key={name} className={styles.releaseGroup}>
                {releaseGroup}
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
                  status="released"
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
