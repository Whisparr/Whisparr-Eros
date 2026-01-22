import React from 'react';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import { kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './StudioDetailsLinks.css';

interface StudioDetailsLinksProps {
  foreignId: string;
  tmdbId?: number;
  tpdbId?: string;
  website?: string;
}

function StudioDetailsLinks({
  foreignId,
  tmdbId,
  tpdbId,
  website,
}: StudioDetailsLinksProps) {
  return (
    <div className={styles.links}>
      {website && (
        <Link className={styles.link} to={website}>
          <Label
            className={styles.linkLabel}
            kind={kinds.INFO}
            size={sizes.LARGE}
          >
            {translate('Homepage')}
          </Label>
        </Link>
      )}
      <Link
        className={styles.link}
        to={`https://stashdb.org/studios/${foreignId}`}
      >
        <Label
          className={styles.linkLabel}
          kind={kinds.INFO}
          size={sizes.LARGE}
        >
          {translate('StashDB')}
        </Label>
      </Link>

      {!!tmdbId && (
        <Link
          className={styles.link}
          to={`https://www.themoviedb.org/company/${tmdbId}`}
        >
          <Label
            className={styles.linkLabel}
            kind={kinds.INFO}
            size={sizes.LARGE}
          >
            {translate('TMDb')}
          </Label>
        </Link>
      )}

      {!!tpdbId && (
        <Link
          className={styles.link}
          to={`https://theporndb.net/sites/${tpdbId}`}
        >
          <Label
            className={styles.linkLabel}
            kind={kinds.INFO}
            size={sizes.LARGE}
          >
            {translate('TPDb')}
          </Label>
        </Link>
      )}
    </div>
  );
}

export default StudioDetailsLinks;
