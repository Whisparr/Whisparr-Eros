import React from 'react';
import Link from 'Components/Link/Link';

export interface PerformerNameLinkProps {
  foreignId: string;
  title: string;
}

function PerformerNameLink({ foreignId, title }: PerformerNameLinkProps) {
  return (
    <Link to={`/performer/${foreignId}`} title={title}>
      {title}
    </Link>
  );
}

export default PerformerNameLink;
