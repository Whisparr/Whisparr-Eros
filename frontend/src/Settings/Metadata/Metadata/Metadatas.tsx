import React from 'react';
import FieldSet from 'Components/FieldSet';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { useMetadata, useSortedMetadata } from 'Settings/Metadata/useMetadata';
import translate from 'Utilities/String/translate';
import Metadata from './Metadata';
import styles from './Metadatas.css';

function Metadatas() {
  const { isFetching, isFetched, error } = useMetadata();
  const items = useSortedMetadata();

  return (
    <FieldSet legend={translate('Metadata')}>
      <PageSectionContent
        errorMessage={translate('MetadataLoadError')}
        error={error ?? undefined}
        isFetching={isFetching}
        isPopulated={isFetched}
      >
        <div className={styles.metadatas}>
          {items.map((item) => {
            return <Metadata key={item.id} metadata={item} />;
          })}
        </div>
      </PageSectionContent>
    </FieldSet>
  );
}

export default Metadatas;
