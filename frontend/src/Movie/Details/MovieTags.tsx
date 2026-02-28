import React from 'react';
import { useSelector } from 'react-redux';
import { Tag } from 'App/State/TagsAppState';
import Label from 'Components/Label';
import { kinds, sizes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import createTagsSelector from 'Store/Selectors/createTagsSelector';
import sortByProp from 'Utilities/Array/sortByProp';

interface MovieTagsProps {
  movie: Movie;
}

function fetchTagList(movie: Movie, tagList: Tag[]) {
  return movie.tags
    .map((id) => tagList.find((tag) => tag.id === id))
    .filter((tag): tag is Tag => Boolean(tag))
    .sort(sortByProp('label'))
    .map((tag) => tag.label);
}

function MovieTags({ movie }: MovieTagsProps) {
  const selectTags = React.useMemo(() => createTagsSelector(), []);
  const tagList = useSelector(selectTags);

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
