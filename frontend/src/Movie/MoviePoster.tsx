import React from 'react';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import posterPlaceholder from 'Components/posterPlaceholder';
import MovieImage, { MovieImageProps } from './MovieImage';

interface MoviePosterProps extends Omit<
  MovieImageProps,
  'coverType' | 'placeholder'
> {
  size?: 250 | 500;
  safeForWorkMode?: boolean;
}

function MoviePoster({
  size = 250,
  ...otherProps
}: Readonly<MoviePosterProps>) {
  const safeForWorkMode = useSafeForWorkMode();
  return (
    <MovieImage
      {...otherProps}
      size={size}
      safeForWorkMode={safeForWorkMode}
      coverType="poster"
      placeholder={posterPlaceholder}
    />
  );
}

export default MoviePoster;
