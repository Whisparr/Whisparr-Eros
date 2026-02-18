import React from 'react';
import MovieCreditPosters from '../MovieCreditPosters';
import MovieCastPoster from './MovieCastPoster';
import { useMovieCastCredits } from './useMovieCastCredits';

interface Props {
  movieId: string | number;
  isSmallScreen: boolean;
}

function MovieCastPostersConnector({ movieId, isSmallScreen }: Props) {
  const {
    data: castCredits = [],
    isLoading,
    isError,
  } = useMovieCastCredits(movieId);

  return !isError && !isLoading && castCredits.length > 0 ? (
    <MovieCreditPosters
      items={castCredits}
      itemComponent={MovieCastPoster}
      isSmallScreen={isSmallScreen}
    />
  ) : null;
}

export default MovieCastPostersConnector;
