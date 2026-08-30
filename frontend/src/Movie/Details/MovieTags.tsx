import React from 'react';
import Label from 'Components/Label';
import { kinds, sizes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import { Tag, useTagList } from 'Tags/useTags';
import sortByProp from 'Utilities/Array/sortByProp';

interface MovieTagsProps {
  movie: Movie;
}

function fetchTagList(movie: Movie, tagList: readonly Tag[]) {
  return movie.tags
    .map((id) => tagList.find((tag) => tag.id === id))
    .filter((tag): tag is Tag => Boolean(tag))
    .sort(sortByProp('label'))
    .map((tag) => tag.label);
}

function MovieTags({ movie }: MovieTagsProps) {
  const tagList = useTagList();

  const tags = fetchTagList(movie, tagList);

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

export default MovieTags;
