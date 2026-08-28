import React from 'react';
import posterPlaceholder from 'Components/posterPlaceholder';
import MovieImage, { MovieImageProps } from './MovieImage';

export type MovieHeadshotProps = Omit<
  MovieImageProps,
  'coverType' | 'placeholder'
>;

function MovieHeadshot({ size = 250, ...otherProps }: MovieHeadshotProps) {
  return (
    <MovieImage
      {...otherProps}
      size={size}
      coverType="headshot"
      placeholder={posterPlaceholder}
    />
  );
}

export default MovieHeadshot;
