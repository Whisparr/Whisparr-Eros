import React from 'react';
import Button from 'Components/Link/Button';
import { kinds } from 'Helpers/Props';
import styles from 'Scene/NoScene.css';
import translate from 'Utilities/String/translate';

function NoPerformer(): React.JSX.Element {
  return (
    <div>
      <div className={styles.message}>
        {translate('AllPerformersHiddenDueToFilter')}
      </div>

      <div className={styles.buttonContainer}>
        <Button to="/add/new/performer" kind={kinds.PRIMARY}>
          {translate('AddNewPerformer')}
        </Button>
      </div>
    </div>
  );
}

export default NoPerformer;
