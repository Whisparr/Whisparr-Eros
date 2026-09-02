import React from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { kinds } from 'Helpers/Props';
import MetadataModel from 'typings/Metadata';
import translate from 'Utilities/String/translate';
import EditMetadataModal from './EditMetadataModal';
import styles from './Metadata.css';

interface MetadataProps {
  metadata: MetadataModel;
}

function Metadata({ metadata }: Readonly<MetadataProps>) {
  const { id, name, enable, fields } = metadata;

  const [
    isEditMetadataModalOpen,
    setEditMetadataModalOpen,
    setEditMetadataModalClosed,
  ] = useModalOpenState(false);

  const metadataFields = fields.filter((field) => field.section === 'metadata');

  const imageFields = fields.filter((field) => field.section !== 'metadata');

  return (
    <Card
      className={styles.metadata}
      overlayContent={true}
      aria-label={translate('MetadataName', { name })}
      onPress={setEditMetadataModalOpen}
    >
      <div className={styles.name}>{name}</div>

      <div>
        {enable ? (
          <Label kind={kinds.SUCCESS}>{translate('Enabled')}</Label>
        ) : (
          <Label kind={kinds.DISABLED} outline={true}>
            {translate('Disabled')}
          </Label>
        )}
      </div>

      {enable && metadataFields.length ? (
        <div>
          <div className={styles.section}>{translate('Metadata')}</div>

          {metadataFields.map((field) => {
            if (!field.value) {
              return null;
            }

            return (
              <Label key={field.label} kind={kinds.SUCCESS}>
                {field.label}
              </Label>
            );
          })}
        </div>
      ) : null}

      {enable && imageFields.length ? (
        <div>
          <div className={styles.section}>{translate('Images')}</div>

          {imageFields.map((field) => {
            if (!field.value) {
              return null;
            }

            return (
              <Label key={field.label} kind={kinds.SUCCESS}>
                {field.label}
              </Label>
            );
          })}
        </div>
      ) : null}

      <EditMetadataModal
        id={id}
        isOpen={isEditMetadataModalOpen}
        onModalClose={setEditMetadataModalClosed}
      />
    </Card>
  );
}

export default Metadata;
