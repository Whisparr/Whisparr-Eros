import React from 'react';
import { kinds } from 'Helpers/Props';
import { Tag } from 'Tags/useTags';
import sortByProp from 'Utilities/Array/sortByProp';
import Label from './Label';
import styles from './TagList.css';

interface TagListProps {
  tags: number[];
  tagList: readonly Tag[];
}

function TagList({ tags, tagList }: TagListProps) {
  const sortedTags = tags
    .map((tagId) => tagList.find((tag) => tag.id === tagId))
    .filter((tag) => !!tag)
    .sort(sortByProp('label'));

  return (
    <div className={styles.tags}>
      {sortedTags.map((tag) => {
        return (
          <Label key={tag.id} kind={kinds.INFO}>
            {tag.label}
          </Label>
        );
      })}
    </div>
  );
}

export default TagList;
