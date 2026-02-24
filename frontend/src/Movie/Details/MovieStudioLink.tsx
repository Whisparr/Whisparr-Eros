import React from 'react';
import Link from 'Components/Link/Link';
import Movie from 'Movie/Movie';

interface MovieStudioLinkProps {
  movie: Movie;
}

function MovieStudioLink(props: MovieStudioLinkProps) {
  const { studioForeignId, studioTitle } = props.movie;

  let link = '';
  if (studioForeignId) {
    link = `/studio/${studioForeignId}`;
  }

  return (
    !!studioTitle && (
      <Link to={link} title={studioTitle} isDisabled={!studioForeignId}>
        {studioTitle}
      </Link>
    )
  );
}

export default MovieStudioLink;
