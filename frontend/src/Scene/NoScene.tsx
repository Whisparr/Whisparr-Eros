import React from 'react';
import Button from 'Components/Link/Button';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './NoScene.css';

export interface NoSceneProps {
  totalItems: number;
}

function NoScene({ totalItems }: NoSceneProps) {
  if (totalItems > 0) {
    return (
      <div>
        <div className={styles.message}>
          {translate('AllScenesHiddenDueToFilter')}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.message}>{translate('NoScenesExist')}</div>

      <div className={styles.buttonContainer}>
        <Button to="/add/import/scenes" kind={kinds.PRIMARY}>
          {translate('ImportExistingScenes')}
        </Button>
      </div>

      <div className={styles.buttonContainer}>
        <Button to="/add/new/scene" kind={kinds.PRIMARY}>
          {translate('AddNewScene')}
        </Button>
      </div>
    </div>
  );
}

export default NoScene;
