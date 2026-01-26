import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createMovieSelector from 'Store/Selectors/createMovieSelector';
import type { ExtraFileRowProps } from './ExtraFileRow';
import ExtraFileTableContent from './ExtraFileTableContent';

interface ExtraFilesState {
  items: ExtraFileRowProps[];
}

interface RootState {
  extraFiles: ExtraFilesState;
}

interface ExtraFileTableContentConnectorProps {
  movieId: number;
}

function createMapStateToProps() {
  return createSelector(
    (_: RootState, { movieId }: { movieId: number }) => movieId,
    (state: RootState) => state.extraFiles,
    createMovieSelector(),
    (movieId: number, extraFiles: ExtraFilesState) => {
      const filesForMovie = extraFiles.items.filter(
        (file: ExtraFileRowProps) => file.movieId === movieId
      );
      return {
        items: filesForMovie,
        error: null,
      };
    }
  );
}

type StateProps = {
  items: ExtraFileRowProps[];
  error: unknown;
};

type Props = ExtraFileTableContentConnectorProps & StateProps;

function ExtraFileTableContentConnector(props: Props) {
  return <ExtraFileTableContent {...props} />;
}

export default connect<
  StateProps,
  object,
  ExtraFileTableContentConnectorProps,
  RootState
>(createMapStateToProps)(ExtraFileTableContentConnector);
