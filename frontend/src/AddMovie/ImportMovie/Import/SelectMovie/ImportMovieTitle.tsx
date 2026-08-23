import React from 'react';
import Label from 'Components/Label';
import { kinds } from 'Helpers/Props';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';
import styles from './ImportMovieTitle.css';

interface ImportMovieTitleProps {
  itemType: string;
  title: string;
  year: number;
  releaseDate?: string;
  studioTitle?: string;
  isExistingMovie: boolean;
}

function ImportMovieTitle({
  itemType,
  title,
  year,
  releaseDate,
  studioTitle,
  isExistingMovie,
}: Readonly<ImportMovieTitleProps>) {
  const { shortDateFormat, showRelativeDates } = useUiSettingsValues();

  let itemDescr = title;
  if (itemType === 'movie' && year) {
    itemDescr = `${itemDescr} (${year})`;
  }

  return (
    <div className={styles.titleContainer}>
      {!!studioTitle && <Label>{studioTitle}</Label>}

      {!!releaseDate && itemType === 'scene' && (
        <Label>
          {getRelativeDate({
            date: releaseDate,
            shortDateFormat,
            showRelativeDates,
          })}
        </Label>
      )}

      <div className={styles.title}>{itemDescr}</div>

      {isExistingMovie && (
        <Label kind={kinds.WARNING}>{translate('Existing')}</Label>
      )}
    </div>
  );
}

export default ImportMovieTitle;
