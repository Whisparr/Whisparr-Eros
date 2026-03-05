import React from 'react';
import MovieLanguages from 'Movie/MovieLanguages';
import { useSingleMovieFile } from './useMovieFile';

interface MovieFileLanguagesProps {
  movieFileId: number;
}

function MovieFileLanguages({ movieFileId }: MovieFileLanguagesProps) {
  const { data: movieFile } = useSingleMovieFile(movieFileId);

  return <MovieLanguages languages={movieFile?.languages ?? []} />;
}

export default MovieFileLanguages;
