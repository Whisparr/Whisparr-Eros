import React from 'react';
import Label from 'Components/Label';
import { kinds, sizes } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';
import Queue from 'typings/Queue';
import getQueueStatusText from 'Utilities/Movie/getQueueStatusText';
import firstCharToUpper from 'Utilities/String/firstCharToUpper';
import translate from 'Utilities/String/translate';
import styles from './MovieStatusLabel.css';

type MovieStatus =
  | 'availNotMonitored'
  | 'ended'
  | 'deleted'
  | 'missingUnmonitored'
  | 'missingMonitored'
  | 'continuing';

interface MovieStatusLabelProps {
  status: string;
  hasMovieFiles: boolean;
  monitored: boolean;
  isAvailable: boolean;
  queueItem?: Queue | false;
  useLabel?: boolean;
}

function getMovieStatus(
  status: string,
  hasFile: boolean,
  isMonitored: boolean,
  isAvailable: boolean,
  queueItem?: Queue | false
): MovieStatus {
  if (queueItem) {
    const queueStatus = queueItem.status;
    const queueState = queueItem.trackedDownloadStatus;
    const queueStatusText = getQueueStatusText(queueStatus, queueState);

    if (queueStatusText) {
      return queueStatusText as MovieStatus;
    }
  }

  if (hasFile && !isMonitored) {
    return 'availNotMonitored';
  }

  if (hasFile) {
    return 'ended';
  }

  if (status === 'deleted') {
    return 'deleted';
  }

  if (isAvailable && !isMonitored && !hasFile) {
    return 'missingUnmonitored';
  }

  if (isAvailable && !hasFile) {
    return 'missingMonitored';
  }

  return 'continuing';
}

function MovieStatusLabel({
  status,
  hasMovieFiles,
  monitored,
  isAvailable,
  queueItem,
  useLabel = false,
}: Readonly<MovieStatusLabelProps>) {
  let movieStatus = getMovieStatus(
    status,
    hasMovieFiles,
    monitored,
    isAvailable,
    queueItem
  );
  let statusClass: string = movieStatus;

  // Normalize movieStatus for display
  if (movieStatus === 'availNotMonitored' || movieStatus === 'ended') {
    movieStatus = 'downloaded' as MovieStatus;
  } else if (
    movieStatus === 'missingMonitored' ||
    movieStatus === 'missingUnmonitored'
  ) {
    movieStatus = 'missing' as MovieStatus;
  } else if (movieStatus === 'continuing') {
    movieStatus = 'notAvailable' as MovieStatus;
  }

  if (queueItem) {
    statusClass = 'queue';
  }

  if (useLabel) {
    let kind: Kind = kinds.SUCCESS;

    switch (statusClass) {
      case 'queue':
        kind = kinds.QUEUE;
        break;
      case 'missingMonitored':
        kind = kinds.DANGER;
        break;
      case 'continuing':
        kind = kinds.INFO;
        break;
      case 'availNotMonitored':
        kind = kinds.DEFAULT;
        break;
      case 'missingUnmonitored':
        kind = kinds.WARNING;
        break;
      case 'deleted':
        kind = kinds.INVERSE;
        break;
      default:
    }

    return (
      <Label kind={kind} size={sizes.LARGE}>
        {translate(firstCharToUpper(movieStatus))}
      </Label>
    );
  }

  return (
    <span className={styles[statusClass as keyof typeof styles]}>
      {translate(firstCharToUpper(movieStatus))}
    </span>
  );
}

export default MovieStatusLabel;
