import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Icon from 'Components/Icon';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Column from 'Components/Table/Column';
import TableRow from 'Components/Table/TableRow';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons } from 'Helpers/Props';
import MovieIndexProgressBar from 'Movie/Index/ProgressBar/MovieIndexProgressBar';
import Movie, { MovieStatus } from 'Movie/Movie';
import MovieSearchCell from 'Movie/MovieSearchCell';
import MovieTitleLink from 'Movie/MovieTitleLink';
import { useToggleMovieMonitored } from 'Movie/useMovie';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import formatRuntime from 'Utilities/Date/formatRuntime';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './SceneRow.css';

interface SceneRowProps {
  movie: Movie;
  isSaving?: boolean;
  safeForWorkMode?: boolean;
  columns: Column[];
}

export default function SceneRow(props: SceneRowProps) {
  const { movieRuntimeFormat } = useSelector(createUISettingsSelector());

  const { isSaving, columns, movie } = props;
  const {
    id,
    itemType,
    foreignId,
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
    studioTitle,
    studioForeignId,
    sizeOnDisk,
  } = movie;

  const status = movie.status as MovieStatus;
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

  const { mutate: toggleMonitored } = useToggleMovieMonitored();
  function onMonitorToggle(): void {
    toggleMonitored({ movie, monitored: !movie.monitored });
  }

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
