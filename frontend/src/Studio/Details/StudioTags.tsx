import React from 'react';
import Label from 'Components/Label';
import { kinds, sizes } from 'Helpers/Props';

interface Tag {
  id: number;
  label: string;
}

interface StudioTagsProps {
  tags: Tag[];
}

function StudioTags({ tags }: StudioTagsProps) {
  return (
    <div>
      {tags.map((tag) => (
        <Label key={tag.id} kind={kinds.INFO} size={sizes.LARGE}>
          {tag.label}
        </Label>
      ))}
    </div>
  );
}

export default StudioTags;
