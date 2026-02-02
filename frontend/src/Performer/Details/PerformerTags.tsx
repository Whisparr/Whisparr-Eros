import React from 'react';
import Label from 'Components/Label';
import { kinds, sizes } from 'Helpers/Props';

export interface Tag {
  id: number;
  label: string;
}

interface PerformerTagsProps {
  tags: Tag[];
}

function PerformerTags({ tags }: PerformerTagsProps) {
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

export default PerformerTags;
