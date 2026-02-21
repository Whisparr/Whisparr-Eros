import React from 'react';
import Link, { LinkProps } from 'Components/Link/Link';

interface MovieTitleLinkProps extends LinkProps {
  title: string;
  year?: number;
  titleSlug?: string;
}

function MovieTitleLink({
  title,
  year = 0,
  titleSlug,
  ...otherProps
}: MovieTitleLinkProps) {
  const link = `/movie/${titleSlug}`;

  return (
    <Link to={link} title={title} {...otherProps}>
      {title}
      {year > 0 ? ` (${year})` : ''}
    </Link>
  );
}

export default MovieTitleLink;
