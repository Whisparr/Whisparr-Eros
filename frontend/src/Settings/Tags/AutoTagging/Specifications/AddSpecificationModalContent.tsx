import React, { useCallback } from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import { useAutoTaggingSchema } from 'Settings/Tags/AutoTagging/useAutoTaggings';
import { AutoTaggingSpecification } from 'typings/AutoTagging';
import translate from 'Utilities/String/translate';
import AddSpecificationItem from './AddSpecificationItem';
import styles from './AddSpecificationModalContent.css';

interface AddSpecificationModalContentProps {
  onModalClose: (selectedSpecification?: AutoTaggingSpecification) => void;
}

export default function AddSpecificationModalContent({
  onModalClose,
}: Readonly<AddSpecificationModalContentProps>) {
  const { schema, isSchemaFetching, isSchemaFetched, schemaError } =
    useAutoTaggingSchema();

  // The pick is handed straight back through `onModalClose` rather than parked
  // in a `selectedSchema` for the next modal to read, which is the whole of
  // what `SELECT_AUTO_TAGGING_SPECIFICATION_SCHEMA` did.
  const handleSpecificationSelect = useCallback(
    ({ implementation }: { implementation: string }) => {
      const selected = schema.find((s) => s.implementation === implementation);

      if (selected) {
        onModalClose(selected);
      }
    },
    [schema, onModalClose]
  );

  const handleModalClose = useCallback(() => {
    onModalClose();
  }, [onModalClose]);

  return (
    <ModalContent onModalClose={handleModalClose}>
      <ModalHeader>{translate('AddCondition')}</ModalHeader>

      <ModalBody>
        {isSchemaFetching ? <LoadingIndicator /> : null}

        {!isSchemaFetching && !!schemaError ? (
          <Alert kind={kinds.DANGER}>{translate('AddConditionError')}</Alert>
        ) : null}

        {isSchemaFetched && !schemaError ? (
          <div>
            <Alert kind={kinds.INFO}>
              <div>{translate('SupportedAutoTaggingProperties')}</div>
            </Alert>

            <div className={styles.specifications}>
              {schema.map((specification) => {
                return (
                  <AddSpecificationItem
                    key={specification.implementation}
                    {...specification}
                    onSpecificationSelect={handleSpecificationSelect}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button onPress={handleModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}
