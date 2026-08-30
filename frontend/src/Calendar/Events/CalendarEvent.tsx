import classNames from 'classnames';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useQueueItemForMovie } from 'Activity/Queue/Details/useQueueDetails';
import { useCalendarOptions } from 'Calendar/calendarOptionsStore';
import getStatusStyle from 'Calendar/getStatusStyle';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons, kinds } from 'Helpers/Props';
import { useSingleMovieFile } from 'MovieFile/useMovieFile';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import translate from 'Utilities/String/translate';
import CalendarEventQueueDetails from './CalendarEventQueueDetails';
import styles from './CalendarEvent.css';

interface CalendarEventProps {
  id: number;
  movieFileId?: number;
  title: string;
  titleSlug: string;
  genres: string[];
  certification?: string;
  date: string;
  inCinemas?: string;
  digitalRelease?: string;
  physicalRelease?: string;
  isAvailable: boolean;
  monitored: boolean;
  hasFile: boolean;
  grabbed?: boolean;
}

function CalendarEvent({
  id,
  movieFileId,
  title,
  titleSlug,
  genres = [],
  certification,
  date,
  inCinemas,
  digitalRelease,
  physicalRelease,
  isAvailable,
  monitored: isMonitored,
  hasFile,
  grabbed,
}: CalendarEventProps) {
  const { data: movieFile } = useSingleMovieFile(movieFileId);
  const queueItem = useQueueItemForMovie(id);

  const { enableColorImpairedMode } = useUiSettingsValues();

  const { showMovieInformation, showCutoffUnmetIcon, fullColorEvents } =
    useCalendarOptions();

  const isDownloading = !!(queueItem || grabbed);
  const statusStyle = getStatusStyle(
    hasFile,
    isDownloading,
    isMonitored,
    isAvailable
  );
  const joinedGenres = genres.slice(0, 2).join(', ');
  const link = `/movie/${titleSlug}`;

  const eventTypes = useMemo(() => {
    const momentDate = moment(date);

    const types = [];

    if (inCinemas && momentDate.isSame(moment(inCinemas), 'day')) {
      types.push('Cinemas');
    }

    if (digitalRelease && momentDate.isSame(moment(digitalRelease), 'day')) {
      types.push('Digital');
    }

    if (physicalRelease && momentDate.isSame(moment(physicalRelease), 'day')) {
      types.push('Physical');
    }

    return types;
  }, [date, inCinemas, digitalRelease, physicalRelease]);

  return (
    <div
      className={classNames(
        styles.event,
        styles[statusStyle],
        enableColorImpairedMode && 'colorImpaired',
        fullColorEvents && 'fullColor'
      )}
    >
      <Link className={styles.underlay} to={link} />

      <div className={styles.overlay}>
        <div className={styles.info}>
          <div className={styles.movieTitle}>{title}</div>

          <div
            className={classNames(
              styles.statusContainer,
              fullColorEvents && 'fullColor'
            )}
          >
            {queueItem ? (
              <span className={styles.statusIcon}>
                <CalendarEventQueueDetails {...queueItem} />
              </span>
            ) : null}

            {!queueItem && grabbed ? (
              <Icon
                className={styles.statusIcon}
                name={icons.DOWNLOADING}
                title={translate('MovieIsDownloading')}
              />
            ) : null}

            {showCutoffUnmetIcon &&
            !!movieFile &&
            movieFile.qualityCutoffNotMet ? (
              <Icon
                className={styles.statusIcon}
                name={icons.MOVIE_FILE}
                kind={kinds.WARNING}
                title={translate('QualityCutoffNotMet')}
              />
            ) : null}
          </div>
        </div>

        {showMovieInformation ? (
          <>
            <div className={styles.movieInfo}>
              <div className={styles.genres}>{joinedGenres}</div>
            </div>

            <div className={styles.movieInfo}>
              <div className={styles.eventType}>{eventTypes.join(', ')}</div>

              <div>{certification}</div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default CalendarEvent;
