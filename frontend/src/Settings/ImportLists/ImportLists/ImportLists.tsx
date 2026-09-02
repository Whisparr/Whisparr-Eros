import React, { useCallback, useState } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import { SelectedSchema } from 'Settings/useProviderSchema';
import translate from 'Utilities/String/translate';
import AddImportListModal from './AddImportListModal';
import EditImportListModal from './EditImportListModal';
import ImportList from './ImportList';
import { useImportLists, useSortedImportLists } from './useImportLists';
import styles from './ImportLists.css';

function ImportLists() {
  const { isFetching, isFetched, error } = useImportLists();
  const items = useSortedImportLists();

  const [selectedSchema, setSelectedSchema] = useState<
    SelectedSchema | undefined
  >(undefined);
  const [cloneId, setCloneId] = useState<number | undefined>(undefined);

  const [isAddImportListModalOpen, setIsAddImportListModalOpen] =
    useState(false);
  const [isEditImportListModalOpen, setIsEditImportListModalOpen] =
    useState(false);

  const handleAddImportListPress = useCallback(() => {
    setIsAddImportListModalOpen(true);
  }, []);

  const handleAddImportListModalClose = useCallback(() => {
    setIsAddImportListModalOpen(false);
  }, []);

  const handleImportListSelect = useCallback((selected: SelectedSchema) => {
    setCloneId(undefined);
    setSelectedSchema(selected);
    setIsAddImportListModalOpen(false);
    setIsEditImportListModalOpen(true);
  }, []);

  const handleEditImportListModalClose = useCallback(() => {
    setIsEditImportListModalOpen(false);
  }, []);

  const handleCloneImportListPress = useCallback((id: number) => {
    setSelectedSchema(undefined);
    setCloneId(id);
    setIsEditImportListModalOpen(true);
  }, []);

  return (
    <FieldSet legend={translate('ImportLists')}>
      <PageSectionContent
        errorMessage={translate('ImportListsLoadError')}
        error={error ?? undefined}
        isFetching={isFetching}
        isPopulated={isFetched}
      >
        <div className={styles.lists}>
          {items.map((item) => {
            return (
              <ImportList
                key={item.id}
                importList={item}
                onCloneImportListPress={handleCloneImportListPress}
              />
            );
          })}

          <Card
            className={styles.addList}
            aria-label={translate('AddImportList')}
            onPress={handleAddImportListPress}
          >
            <div className={styles.center}>
              <Icon name={icons.ADD} size={45} />
            </div>
          </Card>
        </div>

        <AddImportListModal
          isOpen={isAddImportListModalOpen}
          onImportListSelect={handleImportListSelect}
          onModalClose={handleAddImportListModalClose}
        />

        {/* Keyed on the pick so the modal's pending changes start clean each
            time a different implementation -- or a different clone source --
            is chosen. */}
        <EditImportListModal
          key={`${selectedSchema?.implementation}-${selectedSchema?.presetName}-${cloneId}`}
          id={0}
          isOpen={isEditImportListModalOpen}
          selectedSchema={selectedSchema}
          cloneId={cloneId}
          onModalClose={handleEditImportListModalClose}
        />
      </PageSectionContent>
    </FieldSet>
  );
}

export default ImportLists;
