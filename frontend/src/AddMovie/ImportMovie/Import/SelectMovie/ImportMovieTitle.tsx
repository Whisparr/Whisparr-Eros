import React, { useMemo } from 'react';
import Label from 'Components/Label';
import { kinds } from 'Helpers/Props';
import { all as allGenders, getGenderDetails } from 'Performer/Gender';
import PerformerGenderIcon from 'Performer/PerformerGenderIcon';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';
import { ImportCredit } from '../../ImportMovieTypes';
import styles from './ImportMovieTitle.css';

interface ImportMovieTitleProps {
  itemType: string;
  title: string;
  year: number;
  releaseDate?: string;
  studioTitle?: string;
  performerNames?: string[];
  searchCredits?: ImportCredit[];
  isExistingMovie: boolean;
}

// Several genders share one glyph, so the icons are deduplicated by the icon
// they resolve to rather than by the gender string — a scene with two trans
// performers of different genders still gets a single icon.
function getGenderRank(gender: string) {
  const index = (allGenders as string[]).indexOf(gender.toLowerCase());

  // Anything the app doesn't know a glyph for sorts last.
  return index === -1 ? allGenders.length : index;
}

function getGenderIcons(credits: ImportCredit[]) {
  const genders = credits
    .map((credit) => credit.performer?.gender ?? '')
    .sort((a, b) => getGenderRank(a) - getGenderRank(b));

  const seen = new Set<unknown>();

  return genders.filter((gender) => {
    const { icon } = getGenderDetails(gender);

    if (seen.has(icon)) {
      return false;
    }

    seen.add(icon);

    return true;
  });
}

function ImportMovieTitle({
  itemType,
  title,
  year,
  releaseDate,
  studioTitle,
  performerNames,
  searchCredits,
  isExistingMovie,
}: Readonly<ImportMovieTitleProps>) {
  const { shortDateFormat, showRelativeDates } = useUiSettingsValues();

  // Scenes routinely share a title, so the performers are what tell two
  // matches apart. The column has no room for the names, so a gender icon per
  // distinct gender stands in for them and carries the full list on hover.
  const performers = useMemo(() => {
    const credits = searchCredits ?? [];

    const names = credits.length
      ? credits.map((credit) => credit.personName ?? credit.performer?.name)
      : performerNames;

    const unique = Array.from(
      new Set((names ?? []).filter((name): name is string => !!name))
    ).sort((a, b) => a.localeCompare(b));

    if (!unique.length) {
      return null;
    }

    return {
      tooltip: unique.join(', '),
      // Results the server already has locally come back without credits, so
      // there is no gender to show — one neutral icon still carries the names.
      genders: credits.length ? getGenderIcons(credits) : [''],
    };
  }, [performerNames, searchCredits]);

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

      {performers ? (
        <span className={styles.performers} title={performers.tooltip}>
          {performers.genders.map((gender) => (
            <PerformerGenderIcon
              key={gender || 'unknown'}
              className={styles.performerIcon}
              gender={gender}
              size={13}
              title={performers.tooltip}
            />
          ))}
        </span>
      ) : null}

      <div className={styles.title}>{itemDescr}</div>

      {isExistingMovie && (
        <Label kind={kinds.WARNING}>{translate('Existing')}</Label>
      )}
    </div>
  );
}

export default ImportMovieTitle;
