import React from 'react';
import Link from 'Components/Link/Link';

export interface SceneTitleLinkProps {
  titleSlug: string;
  title: string;
  year?: number;
}

function SceneTitleLink({ titleSlug, title, year }: SceneTitleLinkProps) {
  return (
    <Link to={`/movie/${titleSlug}`} title={title}>
      {title}
      {year && year > 0 ? ` (${year})` : ''}
    </Link>
  );
}

export default SceneTitleLink;
