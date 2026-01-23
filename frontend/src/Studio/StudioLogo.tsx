import React from 'react';
import posterPlaceholder from 'Components/posterPlaceholder';
import type { Image } from 'Movie/Movie';
import MovieImage from 'Movie/MovieImage';

export interface StudioLogoProps {
  images: Image[];
  coverType?: string;
  placeholder?: string;
  overflow?: boolean;
  size?: number;
  lazy?: boolean;
  className?: string;
  safeForWorkMode?: boolean;
  style?: object;
  onError?: () => void;
  onLoad?: () => void;
  onPosterLoad?: () => void;
  onPosterLoadError?: () => void;
}

function StudioLogo(props: StudioLogoProps) {
  return (
    <MovieImage
      {...props}
      coverType="clearlogo"
      placeholder={posterPlaceholder}
      images={props.images}
      safeForWorkMode={props.safeForWorkMode ?? false}
      onLoad={props.onPosterLoad}
      onError={props.onPosterLoadError}
    />
  );
}

StudioLogo.defaultProps = {
  size: 250,
};

export default StudioLogo;
