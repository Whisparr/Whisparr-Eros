import React from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import { useNotificationSchema } from 'Settings/Notifications/useNotifications';
import { SelectedSchema } from 'Settings/useProviderSchema';
import translate from 'Utilities/String/translate';
import AddNotificationItem from './AddNotificationItem';
import styles from './AddNotificationModalContent.css';

interface AddNotificationModalContentProps {
  onNotificationSelect: (selectedSchema: SelectedSchema) => void;
  onModalClose: () => void;
}

function AddNotificationModalContent({
  onNotificationSelect,
  onModalClose,
}: Readonly<AddNotificationModalContentProps>) {
  const { isSchemaLoading, isSchemaFetched, schemaError, schema } =
    useNotificationSchema();

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('AddConnection')}</ModalHeader>

      <ModalBody>
        {isSchemaLoading && <LoadingIndicator />}

        {!isSchemaLoading && !!schemaError && (
          <Alert kind={kinds.DANGER}>{translate('AddNotificationError')}</Alert>
        )}

        {isSchemaFetched && !schemaError && (
          <div className={styles.notifications}>
            {schema.map((notification) => {
              return (
                <AddNotificationItem
                  key={notification.implementation}
                  implementation={notification.implementation}
                  implementationName={notification.implementationName}
                  infoLink={notification.infoLink}
                  presets={notification.presets}
                  onNotificationSelect={onNotificationSelect}
                />
              );
            })}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default AddNotificationModalContent;
