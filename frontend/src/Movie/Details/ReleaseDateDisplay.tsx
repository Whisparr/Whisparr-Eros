import React from 'react';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import styles from './MovieDetails.css';

interface Props {
  releaseDate?: string;
}

export default function ReleaseDateDisplay({ releaseDate }: Props) {
  const { showRelativeDates, shortDateFormat, timeFormat } =
    useUiSettingsValues();

  if (!releaseDate) {
    return null;
  }

  return (
    <span className={styles.year}>
      {getRelativeDate({
        date: releaseDate,
        shortDateFormat,
        showRelativeDates,
        timeFormat,
        timeForToday: false,
      })}
    </span>
  );
}
