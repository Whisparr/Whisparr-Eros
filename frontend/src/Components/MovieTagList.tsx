import React from 'react';
import { useTagList } from 'Tags/useTags';
import TagList from './TagList';

interface MovieTagListProps {
  tags: number[];
}

function MovieTagList({ tags }: MovieTagListProps) {
  const tagList = useTagList();

  return <TagList tags={tags} tagList={tagList} />;
}

export default MovieTagList;
