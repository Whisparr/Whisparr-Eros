import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import { useTogglePerformerMonitored } from 'Performer/usePerformer';
import MovieCredit from 'typings/MovieCredit';

interface Props {
  credit: MovieCredit;
  component: React.ElementType;
  posterWidth?: number;
  posterHeight?: number;
}

const selectSafeForWork = (state: AppState) => state.settings.safeForWorkMode;

function MovieCreditPosterConnector(props: Props) {
  const { credit } = props;
  const safeForWorkMode = useSelector(selectSafeForWork);
  const togglePerformerMonitored = useTogglePerformerMonitored();

  const onTogglePerformerMonitored = useCallback(
    (args: { monitored: boolean; moviesMonitored: boolean }) => {
      if (!credit.performerId || !credit.foreignId) return;
      togglePerformerMonitored.mutate({
        performerId: credit.performerId,
        foreignId: credit.foreignId,
        monitored: args.monitored,
        moviesMonitored: args.moviesMonitored,
      });
    },
    [credit.performerId, credit.foreignId, togglePerformerMonitored]
  );

  const ItemComponent = props.component;

  return (
    <ItemComponent
      {...props}
      credit={credit}
      safeForWorkMode={safeForWorkMode}
      onTogglePerformerMonitored={onTogglePerformerMonitored}
    />
  );
}

export default MovieCreditPosterConnector;
