import React from 'react';
import Label from 'Components/Label';
import MovieQuality from 'Movie/MovieQuality';
import translate from 'Utilities/String/translate';
import { useSingleMovieFile } from './useMovieFile';

interface MovieFileQualityProps {
  movieFileId: number | undefined;
}

function MovieFileQuality({ movieFileId }: MovieFileQualityProps) {
  const { data: movieFile } = useSingleMovieFile(movieFileId ?? 0);

  if (!movieFile?.quality) {
    return <Label>{translate('Unknown')}</Label>;
  }

  return <MovieQuality quality={movieFile.quality} size={movieFile.size} />;
}

export default MovieFileQuality;
