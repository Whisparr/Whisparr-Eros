import React, { useCallback } from 'react';
import {
  useMovieCollectionByTmdbId,
  useToggleCollectionMonitored,
} from 'Collection/useMovieCollections';
import MonitorToggleButton, {
  getToggledMonitored,
  MonitorTogglePressValue,
} from 'Components/MonitorToggleButton';
import translate from 'Utilities/String/translate';
import styles from './MovieCollectionLabel.css';

interface MovieCollectionLabelProps {
  tmdbId: number;
}

function MovieCollectionLabel({ tmdbId }: MovieCollectionLabelProps) {
  // Was `state.movieCollections.items`, which only the collections page ever
  // filled, so this label read an empty list here and always rendered
  // "Unknown".
  const collection = useMovieCollectionByTmdbId(tmdbId);

  const toggleMonitored = useToggleCollectionMonitored();

  const handleMonitorTogglePress = useCallback(
    (value: MonitorTogglePressValue) => {
      if (collection) {
        toggleMonitored.mutate({
          ...collection,
          monitored: getToggledMonitored(value),
        });
      }
    },
    [collection, toggleMonitored]
  );

  if (!collection) {
    return translate('Unknown');
  }

  return (
    <div>
      <MonitorToggleButton
        className={styles.monitorToggleButton}
        monitored={collection.monitored}
        isSaving={toggleMonitored.isPending}
        size={15}
        onPress={handleMonitorTogglePress}
      />
      {collection.title}
    </div>
  );
}

export default MovieCollectionLabel;
