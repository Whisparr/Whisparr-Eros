import React from 'react';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import posterPlaceholder from 'Components/posterPlaceholder';
import MovieImage, { MovieImageProps } from '../Movie/MovieImage';

interface ScenePosterProps extends Omit<
  MovieImageProps,
  'coverType' | 'placeholder'
> {
  size?: 180;
  safeForWorkMode: boolean;
}

function ScenePoster({
  size = 180,
  ...otherProps
}: Readonly<ScenePosterProps>) {
  const safeForWorkMode = useSafeForWorkMode();
  return (
    <MovieImage
      {...otherProps}
      size={size}
      safeForWorkMode={safeForWorkMode}
      coverType="screenshot"
      placeholder={posterPlaceholder}
    />
  );
}

export default ScenePoster;
