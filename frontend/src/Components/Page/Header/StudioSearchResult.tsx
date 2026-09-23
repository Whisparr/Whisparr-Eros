import React from 'react';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import Label from 'Components/Label';
import { kinds, sizes } from 'Helpers/Props';
import Studio from 'Studio/Studio';
import StudioLogo from 'Studio/StudioLogo';
import translate from 'Utilities/String/translate';
import styles from './MovieSearchResult.css';

type StudioSearchResultProps = Pick<Studio, 'title' | 'network' | 'images'>;

function StudioSearchResult({
  title,
  network,
  images,
}: Readonly<StudioSearchResultProps>) {
  const safeForWorkMode = useSafeForWorkMode();

  return (
    <div className={styles.result}>
      <div className={styles.posterContainer}>
        <StudioLogo
          className={styles.poster}
          images={images}
          size={250}
          lazy={false}
          overflow={true}
          safeForWorkMode={safeForWorkMode}
          title={title}
        />
      </div>

      <div className={styles.titles}>
        <div className={styles.title}>{title}</div>

        <div className={styles.metaRow}>
          <Label size={sizes.LARGE} kind={kinds.INVERSE} outline={true}>
            {translate('Studio')}
          </Label>

          {network && network !== title ? (
            <div className={styles.runtime}>{network}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default StudioSearchResult;
