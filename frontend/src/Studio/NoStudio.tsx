import React from 'react';
import Button from 'Components/Link/Button';
import { kinds } from 'Helpers/Props';
import styles from 'Scene/NoScene.css';
import translate from 'Utilities/String/translate';

export interface NoStudioProps {
  totalItems: number;
}

function NoStudio({ totalItems }: NoStudioProps) {
  if (totalItems > 0) {
    return (
      <div>
        <div className={styles.message}>
          {translate('AllStudiosHiddenDueToFilter')}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.message}>{translate('NoStudiosExist')}</div>

      <div className={styles.buttonContainer}>
        <Button to="/add/import/scenes" kind={kinds.PRIMARY}>
          {translate('ImportExistingScenes')}
        </Button>
      </div>

      <div className={styles.buttonContainer}>
        <Button to="/add/new/studio" kind={kinds.PRIMARY}>
          {translate('AddNewStudio')}
        </Button>
      </div>
    </div>
  );
}

export default NoStudio;
