import React from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { kinds } from 'Helpers/Props';
import useTagDetails from 'Tags/useTagDetails';
import useTags, { useSortedTagList } from 'Tags/useTags';
import translate from 'Utilities/String/translate';
import Tag from './Tag';
import styles from './Tags.css';

function Tags() {
  const items = useSortedTagList();
  const { isFetching, isFetched, error } = useTags();

  const {
    isFetching: isDetailsFetching,
    isFetched: isDetailsFetched,
    error: detailsError,
  } = useTagDetails();

  if (!items.length) {
    return (
      <Alert kind={kinds.INFO}>{translate('NoTagsHaveBeenAddedYet')}</Alert>
    );
  }

  return (
    <FieldSet legend={translate('Tags')}>
      <PageSectionContent
        errorMessage={translate('TagsLoadError')}
        error={error ?? detailsError ?? undefined}
        isFetching={isFetching || isDetailsFetching}
        isPopulated={isFetched || isDetailsFetched}
      >
        <div className={styles.tags}>
          {items.map((item) => {
            return <Tag key={item.id} {...item} />;
          })}
        </div>
      </PageSectionContent>
    </FieldSet>
  );
}

export default Tags;
