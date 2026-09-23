import React from 'react';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import Label from 'Components/Label';
import { kinds, sizes } from 'Helpers/Props';
import MovieHeadshot from 'Movie/MovieHeadshot';
import Performer from 'Performer/Performer';
import PerformerGenderIcon from 'Performer/PerformerGenderIcon';
import translate from 'Utilities/String/translate';
import styles from './MovieSearchResult.css';

type PerformerSearchResultProps = Pick<
  Performer,
  'name' | 'fullName' | 'gender' | 'images'
>;

function PerformerSearchResult({
  name,
  fullName,
  gender,
  images,
}: Readonly<PerformerSearchResultProps>) {
  const safeForWorkMode = useSafeForWorkMode();

  return (
    <div className={styles.result}>
      <div className={styles.posterContainer}>
        <MovieHeadshot
          className={styles.poster}
          images={images}
          size={250}
          lazy={false}
          overflow={true}
          safeForWorkMode={safeForWorkMode}
          title={fullName || name}
        />
      </div>

      <div className={styles.titles}>
        <div className={styles.title}>{fullName || name}</div>

        <div className={styles.metaRow}>
          <Label size={sizes.LARGE} kind={kinds.INVERSE} outline={true}>
            {translate('Performer')}
          </Label>

          {gender ? <PerformerGenderIcon gender={gender} /> : null}
        </div>
      </div>
    </div>
  );
}

export default PerformerSearchResult;
