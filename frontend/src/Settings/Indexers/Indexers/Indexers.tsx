import React, { useCallback, useState } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import { SelectedSchema } from 'Settings/useProviderSchema';
import translate from 'Utilities/String/translate';
import AddIndexerModal from './AddIndexerModal';
import EditIndexerModal from './EditIndexerModal';
import Indexer from './Indexer';
import { useIndexers, useSortedIndexers } from './useIndexers';
import styles from './Indexers.css';

function Indexers() {
  const { isFetching, isFetched, error } = useIndexers();
  const items = useSortedIndexers();

  const [selectedSchema, setSelectedSchema] = useState<
    SelectedSchema | undefined
  >(undefined);
  const [cloneId, setCloneId] = useState<number | undefined>(undefined);

  const [isAddIndexerModalOpen, setIsAddIndexerModalOpen] = useState(false);
  const [isEditIndexerModalOpen, setIsEditIndexerModalOpen] = useState(false);

  const showPriority = items.some((index) => index.priority !== 25);

  const handleAddIndexerPress = useCallback(() => {
    setIsAddIndexerModalOpen(true);
  }, []);

  const handleCloneIndexerPress = useCallback((id: number) => {
    setSelectedSchema(undefined);
    setCloneId(id);
    setIsEditIndexerModalOpen(true);
  }, []);

  const handleIndexerSelect = useCallback((selected: SelectedSchema) => {
    setCloneId(undefined);
    setSelectedSchema(selected);
    setIsAddIndexerModalOpen(false);
    setIsEditIndexerModalOpen(true);
  }, []);

  const handleAddIndexerModalClose = useCallback(() => {
    setIsAddIndexerModalOpen(false);
  }, []);

  const handleEditIndexerModalClose = useCallback(() => {
    setIsEditIndexerModalOpen(false);
  }, []);

  return (
    <FieldSet legend={translate('Indexers')}>
      <PageSectionContent
        errorMessage={translate('IndexersLoadError')}
        error={error ?? undefined}
        isFetching={isFetching}
        isPopulated={isFetched}
      >
        <div className={styles.indexers}>
          {items.map((item) => {
            return (
              <Indexer
                key={item.id}
                indexer={item}
                showPriority={showPriority}
                onCloneIndexerPress={handleCloneIndexerPress}
              />
            );
          })}

          <Card className={styles.addIndexer} onPress={handleAddIndexerPress}>
            <div className={styles.center}>
              <Icon name={icons.ADD} size={45} />
            </div>
          </Card>
        </div>

        <AddIndexerModal
          isOpen={isAddIndexerModalOpen}
          onIndexerSelect={handleIndexerSelect}
          onModalClose={handleAddIndexerModalClose}
        />

        {/* Keyed on the pick so the modal's pending changes start clean each
            time a different implementation -- or a different clone source --
            is chosen. */}
        <EditIndexerModal
          key={`${selectedSchema?.implementation}-${selectedSchema?.presetName}-${cloneId}`}
          id={0}
          isOpen={isEditIndexerModalOpen}
          selectedSchema={selectedSchema}
          cloneId={cloneId}
          onModalClose={handleEditIndexerModalClose}
        />
      </PageSectionContent>
    </FieldSet>
  );
}

export default Indexers;
