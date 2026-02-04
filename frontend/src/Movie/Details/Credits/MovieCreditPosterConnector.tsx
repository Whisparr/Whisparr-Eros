import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import { togglePerformerMonitored } from 'Store/Actions/performerActions';
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
  const dispatch = useDispatch();

  const performerId = credit.performerId;

  const onTogglePerformerMonitored = useCallback(
    (args: { monitored: boolean; moviesMonitored: boolean }) => {
      if (performerId === 0) return;
      const monitored = args.monitored;
      const moviesMonitored = args.moviesMonitored;
      dispatch(
        togglePerformerMonitored({
          performerId,
          monitored,
          moviesMonitored,
        })
      );
      props.credit.monitored = monitored;
      props.credit.moviesMonitored = moviesMonitored;
    },
    [performerId, dispatch, props.credit]
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
