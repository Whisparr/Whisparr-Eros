import React from 'react';
import Label from 'Components/Label';
import { kinds, sizes } from 'Helpers/Props';

interface StudioTagsProps {
  tags: string[];
}

function StudioTags({ tags }: StudioTagsProps) {
  return (
    <div>
      {tags.map((tag) => (
        <Label key={tag} kind={kinds.INFO} size={sizes.LARGE}>
          {tag}
        </Label>
      ))}
    </div>
  );
}

export default StudioTags;
