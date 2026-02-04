import React from 'react';
import { useSelector } from 'react-redux';
import createMovieCreditsSelector from 'Store/Selectors/createMovieCreditsSelector';
import MovieCreditPosters from '../MovieCreditPosters';
import MovieCastPoster from './MovieCastPoster';

interface Props {
  movieId: number;
  isSmallScreen: boolean;
}

function MovieCastPostersConnector({ isSmallScreen }: Props) {
  const { items: castCredits } = useSelector(
    createMovieCreditsSelector('cast')
  );

  return (
    <MovieCreditPosters
      items={castCredits}
      itemComponent={MovieCastPoster}
      isSmallScreen={isSmallScreen}
    />
  );
}

export default MovieCastPostersConnector;
