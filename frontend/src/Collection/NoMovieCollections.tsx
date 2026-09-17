import React from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import { kinds } from 'Helpers/Props';
import { useGeneralSettings } from 'Settings/General/useGeneralSettings';
import translate from 'Utilities/String/translate';
import styles from './NoMovieCollections.css';

interface NoMovieCollectionsProps {
  totalItems: number;
}

function NoMovieCollections({ totalItems }: Readonly<NoMovieCollectionsProps>) {
  const { data: generalSettings } = useGeneralSettings();

  if (totalItems > 0) {
    return (
      <div>
        <div className={styles.message}>
          {translate('AllCollectionsHiddenDueToFilter')}
        </div>
      </div>
    );
  }

  // Collections only ever come from TMDb: the TPDb movie resource carries no
  // collection, so with TPDb as the source this page can never fill, and
  // "add a new movie" would send the user off to do something that won't help.
  if (generalSettings.whisparrMovieMetadataSource?.toLowerCase() === 'tpdb') {
    return (
      <Alert kind={kinds.WARNING}>
        {translate('CollectionsUnavailableWithTpdb')}
      </Alert>
    );
  }

  return (
    <div>
      <div className={styles.message}>{translate('NoCollections')}</div>

      <div className={styles.buttonContainer}>
        <Button to="/add/new/movie" kind={kinds.PRIMARY}>
          {translate('AddNewMovie')}
        </Button>
      </div>
    </div>
  );
}

export default NoMovieCollections;
