import React, { useMemo } from 'react';
import { useTagList } from 'Tags/useTags';
import FilterBuilderRowValue from './FilterBuilderRowValue';

type TagFilterBuilderRowValueProps = Omit<
  React.ComponentProps<typeof FilterBuilderRowValue>,
  'tagList'
>;

// Was a connector whose entire job was mapping the tag list into the
// `{ id, name }` shape FilterBuilderRowValue wants. With the list on a hook
// there is nothing left for connect() to do.
function TagFilterBuilderRowValue(props: TagFilterBuilderRowValueProps) {
  const tags = useTagList();

  const tagList = useMemo(
    () => tags.map(({ id, label: name }) => ({ id, name })),
    [tags]
  );

  return <FilterBuilderRowValue {...props} tagList={tagList} />;
}

export default TagFilterBuilderRowValue;
