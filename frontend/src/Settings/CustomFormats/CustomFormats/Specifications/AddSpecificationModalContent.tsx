import React, { useCallback } from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import { useCustomFormatSpecificationSchema } from 'Settings/CustomFormats/CustomFormats/useCustomFormats';
import { CustomFormatSpecification } from 'typings/CustomFormat';
import translate from 'Utilities/String/translate';
import AddSpecificationItem, {
  SelectedSpecification,
} from './AddSpecificationItem';
import styles from './AddSpecificationModalContent.css';

interface AddSpecificationModalContentProps {
  onModalClose: (selectedSpecification?: CustomFormatSpecification) => void;
}

export default function AddSpecificationModalContent({
  onModalClose,
}: Readonly<AddSpecificationModalContentProps>) {
  const { schema, isSchemaLoading, isSchemaFetched, schemaError } =
    useCustomFormatSpecificationSchema();

  // The pick is handed straight back through `onModalClose` rather than parked
  // in a `selectedSchema` for the next modal to read, which is the whole of
  // what `SELECT_CUSTOM_FORMAT_SPECIFICATION_SCHEMA` did. Unlike auto tagging,
  // the pick can be a preset -- `/customformat/schema` hangs six built-in ones
  // plus every existing format's conditions off Release Title -- so the preset
  // name has to survive the hand-back, and `presets` has to be dropped from
  // what is handed over: it is schema decoration the server rejects, which is
  // the `delete result.presets` in `getProviderState`.
  const handleSpecificationSelect = useCallback(
    ({ implementation, presetName }: SelectedSpecification) => {
      const selectedImplementation = schema.find(
        (s) => s.implementation === implementation
      );

      if (!selectedImplementation) {
        return;
      }

      const selected = presetName
        ? selectedImplementation.presets?.find((p) => p.name === presetName)
        : selectedImplementation;

      if (!selected) {
        return;
      }

      const { presets, ...specification } = selected;

      onModalClose(specification as CustomFormatSpecification);
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
        {isSchemaLoading ? <LoadingIndicator /> : null}

        {!isSchemaLoading && !!schemaError ? (
          <Alert kind={kinds.DANGER}>{translate('AddConditionError')}</Alert>
        ) : null}

        {isSchemaFetched && !schemaError ? (
          <div>
            <Alert kind={kinds.INFO}>
              <div>{translate('SupportedCustomConditions')}</div>
              <div>
                {translate('VisitTheWikiForMoreDetails')}
                <Link to="https://wiki.servarr.com/whisparr/settings#custom-formats-2">
                  {translate('Wiki')}
                </Link>
              </div>
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
