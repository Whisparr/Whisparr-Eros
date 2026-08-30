import { Tag, useTagList } from 'Tags/useTags';

export function usePerformerTags(tagIds: number[]): Tag[] {
  const tagList = useTagList();

  return tagIds
    .map((tagId) => tagList.find((tag) => tag.id === tagId))
    .filter((tag): tag is Tag => !!tag);
}
