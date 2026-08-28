import React, { useMemo } from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import { SelectedSchema } from 'Settings/useProviderSchema';
import Indexer from 'typings/Indexer';
import translate from 'Utilities/String/translate';
import AddIndexerItem from './AddIndexerItem';
import { useIndexerSchema } from './useIndexers';
import styles from './AddIndexerModalContent.css';

interface AddIndexerModalContentProps {
  onIndexerSelect: (selectedSchema: SelectedSchema) => void;
  onModalClose: () => void;
}

function AddIndexerModalContent({
  onIndexerSelect,
  onModalClose,
}: Readonly<AddIndexerModalContentProps>) {
  const { isSchemaFetching, isSchemaFetched, schemaError, schema } =
    useIndexerSchema();

  const { usenetIndexers, torrentIndexers } = useMemo(() => {
    return schema.reduce<{
      usenetIndexers: Indexer[];
      torrentIndexers: Indexer[];
    }>(
      (acc, item) => {
        if (item.protocol === 'usenet') {
          acc.usenetIndexers.push(item);
        } else if (item.protocol === 'torrent') {
          acc.torrentIndexers.push(item);
        }

        return acc;
      },
      {
        usenetIndexers: [],
        torrentIndexers: [],
      }
    );
  }, [schema]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('AddIndexer')}</ModalHeader>

      <ModalBody>
        {isSchemaFetching ? <LoadingIndicator /> : null}

        {!isSchemaFetching && !!schemaError ? (
          <Alert kind={kinds.DANGER}>{translate('AddIndexerError')}</Alert>
        ) : null}

        {isSchemaFetched && !schemaError ? (
          <div>
            <Alert kind={kinds.INFO}>
              <div>{translate('SupportedIndexers')}</div>
              <div>{translate('SupportedIndexersMoreInfo')}</div>
            </Alert>

            <FieldSet legend={translate('Usenet')}>
              <div className={styles.indexers}>
                {usenetIndexers.map((indexer) => {
                  return (
                    <AddIndexerItem
                      key={indexer.implementation}
                      implementation={indexer.implementation}
                      implementationName={indexer.implementationName}
                      infoLink={indexer.infoLink}
                      presets={indexer.presets}
                      onIndexerSelect={onIndexerSelect}
                    />
                  );
                })}
              </div>
            </FieldSet>

            <FieldSet legend={translate('Torrents')}>
              <div className={styles.indexers}>
                {torrentIndexers.map((indexer) => {
                  return (
                    <AddIndexerItem
                      key={indexer.implementation}
                      implementation={indexer.implementation}
                      implementationName={indexer.implementationName}
                      infoLink={indexer.infoLink}
                      presets={indexer.presets}
                      onIndexerSelect={onIndexerSelect}
                    />
                  );
                })}
              </div>
            </FieldSet>
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default AddIndexerModalContent;
