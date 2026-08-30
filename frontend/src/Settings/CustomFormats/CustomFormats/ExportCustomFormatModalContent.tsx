import React from 'react';
import Button from 'Components/Link/Button';
import ClipboardButton from 'Components/Link/ClipboardButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import CustomFormat from 'typings/CustomFormat';
import translate from 'Utilities/String/translate';
import styles from './ExportCustomFormatModalContent.css';

interface ExportCustomFormatModalContentProps {
  customFormat: CustomFormat;
  onModalClose: () => void;
}

// What the import modal reads back, and what the wiki and TRaSH share around:
// the format minus every id, with each condition's fields collapsed to a
// name/value map. The connector built the same thing with a `JSON.stringify`
// replacer, because the value it had to serialise was the pending-wrapped
// `item` rather than the format itself. Reading the format straight off the
// list query, the shape can just be written down.
function getExportJson(customFormat: CustomFormat) {
  return JSON.stringify(
    {
      name: customFormat.name,
      includeCustomFormatWhenRenaming:
        customFormat.includeCustomFormatWhenRenaming,
      specifications: customFormat.specifications.map((specification) => ({
        name: specification.name,
        implementation: specification.implementation,
        negate: specification.negate,
        required: specification.required,
        fields: Object.fromEntries(
          specification.fields.map((field) => [field.name, field.value])
        ),
      })),
    },
    null,
    2
  );
}

export default function ExportCustomFormatModalContent({
  customFormat,
  onModalClose,
}: Readonly<ExportCustomFormatModalContentProps>) {
  const json = getExportJson(customFormat);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('ExportCustomFormat')}</ModalHeader>

      <ModalBody>
        <div>
          <pre>{json}</pre>
        </div>
      </ModalBody>

      <ModalFooter>
        <ClipboardButton
          className={styles.button}
          value={json}
          title={translate('CopyToClipboard')}
          kind={kinds.DEFAULT}
        />

        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}
