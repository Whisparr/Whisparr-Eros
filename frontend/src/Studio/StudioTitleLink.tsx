import React from 'react';
import Link from 'Components/Link/Link';

export interface StudioTitleLinkProps {
  foreignId: string;
  title: string;
}

function StudioTitleLink({ foreignId, title }: StudioTitleLinkProps) {
  const link = `/studio/${foreignId}`;
  return (
    <Link to={link} title={title}>
      {title}
    </Link>
  );
}

export default StudioTitleLink;
