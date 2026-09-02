import React, { useCallback, useState } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import { SelectedSchema } from 'Settings/useProviderSchema';
import translate from 'Utilities/String/translate';
import AddDownloadClientModal from './AddDownloadClientModal';
import DownloadClient from './DownloadClient';
import EditDownloadClientModal from './EditDownloadClientModal';
import {
  useDownloadClients,
  useSortedDownloadClients,
} from './useDownloadClients';
import styles from './DownloadClients.css';

function DownloadClients() {
  const { isFetching, isFetched, error } = useDownloadClients();
  const items = useSortedDownloadClients();

  const [selectedSchema, setSelectedSchema] = useState<
    SelectedSchema | undefined
  >(undefined);

  const [isAddDownloadClientModalOpen, setIsAddDownloadClientModalOpen] =
    useState(false);
  const [isEditDownloadClientModalOpen, setIsEditDownloadClientModalOpen] =
    useState(false);

  const handleAddDownloadClientPress = useCallback(() => {
    setIsAddDownloadClientModalOpen(true);
  }, []);

  const handleDownloadClientSelect = useCallback((selected: SelectedSchema) => {
    setSelectedSchema(selected);
    setIsAddDownloadClientModalOpen(false);
    setIsEditDownloadClientModalOpen(true);
  }, []);

  const handleAddDownloadClientModalClose = useCallback(() => {
    setIsAddDownloadClientModalOpen(false);
  }, []);

  const handleEditDownloadClientModalClose = useCallback(() => {
    setIsEditDownloadClientModalOpen(false);
  }, []);

  return (
    <FieldSet legend={translate('DownloadClients')}>
      <PageSectionContent
        errorMessage={translate('DownloadClientsLoadError')}
        error={error ?? undefined}
        isFetching={isFetching}
        isPopulated={isFetched}
      >
        <div className={styles.downloadClients}>
          {items.map((item) => {
            return <DownloadClient key={item.id} downloadClient={item} />;
          })}

          <Card
            className={styles.addDownloadClient}
            aria-label={translate('AddDownloadClient')}
            onPress={handleAddDownloadClientPress}
          >
            <div className={styles.center}>
              <Icon name={icons.ADD} size={45} />
            </div>
          </Card>
        </div>

        <AddDownloadClientModal
          isOpen={isAddDownloadClientModalOpen}
          onDownloadClientSelect={handleDownloadClientSelect}
          onModalClose={handleAddDownloadClientModalClose}
        />

        {/* Keyed on the pick so the modal's pending changes start clean each
            time a different implementation -- or a different preset -- is
            chosen. */}
        <EditDownloadClientModal
          key={`${selectedSchema?.implementation}-${selectedSchema?.presetName}`}
          id={0}
          isOpen={isEditDownloadClientModalOpen}
          selectedSchema={selectedSchema}
          onModalClose={handleEditDownloadClientModalClose}
        />
      </PageSectionContent>
    </FieldSet>
  );
}

export default DownloadClients;
