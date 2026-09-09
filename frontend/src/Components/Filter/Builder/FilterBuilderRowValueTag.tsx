import React from 'react';
import { TagBase } from 'Components/Form/Tag/TagInput';
import TagInputTag, { TagInputTagProps } from 'Components/Form/Tag/TagInputTag';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './FilterBuilderRowValueTag.css';

// `isLastTag` comes from `TagInputInput`, which passes it to every tag
// component; `TagInputTag` itself ignores it.
export interface FilterBuilderRowValueTagProps<T extends TagBase> extends Omit<
  TagInputTagProps<T>,
  'kind'
> {
  kind?: TagInputTagProps<T>['kind'];
  isLastTag: boolean;
}

function FilterBuilderRowValueTag<T extends TagBase>({
  isLastTag,
  // `TagInputInput` supplies one, and this is the fallback the spread used to
  // sit behind.
  kind = kinds.DEFAULT,
  ...otherProps
}: Readonly<FilterBuilderRowValueTagProps<T>>) {
  return (
    <div className={styles.tag}>
      <TagInputTag kind={kind} {...otherProps} />

      {isLastTag ? null : <div className={styles.or}>{translate('Or')}</div>}
    </div>
  );
}

export default FilterBuilderRowValueTag;
