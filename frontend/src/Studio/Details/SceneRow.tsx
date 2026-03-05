import React from 'react';
import { useSelector } from 'react-redux';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Column from 'Components/Table/Column';
import TableRow from 'Components/Table/TableRow';
import MovieIndexProgressBar from 'Movie/Index/ProgressBar/MovieIndexProgressBar';
import Movie, { MovieStatus } from 'Movie/Movie';
import MovieSearchCell from 'Movie/MovieSearchCell';
import MovieTitleLink from 'Movie/MovieTitleLink';
import { useToggleMovieMonitored } from 'Movie/useMovie';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import formatRuntime from 'Utilities/Date/formatRuntime';
import formatBytes from 'Utilities/Number/formatBytes';
import styles from './SceneRow.css';

interface SceneRowProps {
  movie: Movie;
  isSaving?: boolean;
  safeForWorkMode?: boolean;
  columns: Column[];
}

/*
interface SceneRowState {
  isDetailsModalOpen: boolean;
}
*/

export default function SceneRow(props: SceneRowProps) {
  const { movieRuntimeFormat } = useSelector(createUISettingsSelector());

  /*
const onManualSearchPress = (): void => {
  setIsDetailsModalOpen(true);
  };


const onDetailsModalClose = (): void => {
  setIsDetailsModalOpen(false);
  };
*/

  const { isSaving, columns, movie } = props;

  const {
    id,
    itemType,
    monitored,
    performerNames,
    runtime,
    path,
    isAvailable,
    hasFile,
    movieFile,
    releaseDate,
    title,
    titleSlug,
    sizeOnDisk,
  } = movie;

  const status = movie.status as MovieStatus;

  const { mutate: toggleMonitored } = useToggleMovieMonitored();
  function onMonitorToggle(): void {
    toggleMonitored({ movie, monitored: !movie.monitored });
  }

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
                onPress={onMonitorToggle}
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

        if (name === 'path') {
          return path ? (
            <TableRowCell
              key={name}
              className={props.safeForWorkMode ? styles.blurred : styles.path}
            >
              {path}
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
