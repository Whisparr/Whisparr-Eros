import React from 'react';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import { kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './SceneDetailsLinks.css';

export interface SceneDetailsLinksProps {
  foreignId: string;
}

function SceneDetailsLinks({ foreignId }: SceneDetailsLinksProps) {
  return (
    <div className={styles.links}>
      <Link
        className={styles.link}
        to={`https://stashdb.org/scenes/${foreignId}`}
      >
        <Label
          className={styles.linkLabel}
          kind={kinds.INFO}
          size={sizes.LARGE}
        >
          {translate('StashDB')}
        </Label>
      </Link>
    </div>
  );
}

export default SceneDetailsLinks;
