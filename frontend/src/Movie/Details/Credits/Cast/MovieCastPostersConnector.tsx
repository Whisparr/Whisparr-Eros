import React from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import translate from 'Utilities/String/translate';
import MovieCreditPosters from '../MovieCreditPosters';
import MovieCastPoster from './MovieCastPoster';
import { useMovieCastCredits } from './useMovieCastCredits';

interface Props {
  movieId: string | number;
  isSmallScreen: boolean;
}

function MovieCastPostersConnector({
  movieId,
  isSmallScreen,
}: Readonly<Props>) {
  const {
    data: castCredits = [],
    isLoading,
    isError,
    error,
  } = useMovieCastCredits(movieId);

  if (isError) {
    return (
      <Alert kind="danger">
        {`${translate('LoadingMovieCreditsFailed')} ${
          error?.message || translate('UnknownError')
        }`}
      </Alert>
    );
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return !isError && !isLoading && castCredits.length > 0 ? (
    <MovieCreditPosters
      items={castCredits}
      itemComponent={MovieCastPoster}
      isSmallScreen={isSmallScreen}
    />
  ) : null;
}

export default MovieCastPostersConnector;
