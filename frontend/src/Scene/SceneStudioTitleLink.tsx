import React from 'react';
import Link from 'Components/Link/Link';

export interface SceneStudioTitleLinkProps {
  studioForeignId: string;
  studioTitle: string;
}

function SceneStudioTitleLink({
  studioForeignId,
  studioTitle,
}: SceneStudioTitleLinkProps) {
  return (
    <Link to={`/studio/${studioForeignId}`} title={studioTitle}>
      {studioTitle}
    </Link>
  );
}

export default SceneStudioTitleLink;
