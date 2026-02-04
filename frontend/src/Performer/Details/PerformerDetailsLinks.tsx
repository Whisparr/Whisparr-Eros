import React from 'react';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import { kinds, sizes } from 'Helpers/Props';
import Performer from 'Performer/Performer';
import translate from 'Utilities/String/translate';
import styles from './PerformerDetailsLinks.css';

type PerformerDetailsLinksProps = Pick<
  Performer,
  'tmdbId' | 'tpdbId' | 'foreignId'
>;

function PerformerDetailsLinks(props: PerformerDetailsLinksProps) {
  const { tmdbId, tpdbId, foreignId } = props;

  return (
    <div className={styles.links}>
      {foreignId ? (
        <Link
          className={styles.link}
          to={`https://stashdb.org/performers/${foreignId}`}
        >
          <Label
            className={styles.linkLabel}
            kind={kinds.INFO}
            size={sizes.LARGE}
          >
            {translate('StashDB')}
          </Label>
        </Link>
      ) : null}

      {tmdbId ? (
        <Link
          className={styles.link}
          to={`https://www.themoviedb.org/person/${tmdbId}`}
        >
          <Label
            className={styles.linkLabel}
            kind={kinds.INFO}
            size={sizes.LARGE}
          >
            {translate('TMDb')}
          </Label>
        </Link>
      ) : null}

      {tpdbId ? (
        <Link
          className={styles.link}
          to={`https://theporndb.net/performers/${tpdbId}`}
        >
          <Label
            className={styles.linkLabel}
            kind={kinds.INFO}
            size={sizes.LARGE}
          >
            {translate('TPDB')}
          </Label>
        </Link>
      ) : null}
    </div>
  );
}

export default PerformerDetailsLinks;
