import { useSelector } from 'react-redux';
import { Tag } from 'App/State/TagsAppState';
import createTagsSelector from 'Store/Selectors/createTagsSelector';

export function usePerformerTags(tagIds: number[]): Tag[] {
  const tagList: Tag[] = useSelector(createTagsSelector());

  return tagIds
    .map((tagId) => tagList.find((tag) => tag.id === tagId))
    .filter((tag): tag is Tag => !!tag);
}
