import React, { useCallback, useState } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { icons, kinds } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';
import CustomFormatModel from 'typings/CustomFormat';
import translate from 'Utilities/String/translate';
import EditCustomFormatModal from './EditCustomFormatModal';
import ExportCustomFormatModal from './ExportCustomFormatModal';
import { useDeleteCustomFormat } from './useCustomFormats';
import styles from './CustomFormat.css';

interface CustomFormatProps {
  customFormat: CustomFormatModel;
  onCloneCustomFormatPress: (id: number) => void;
}

export default function CustomFormat({
  customFormat,
  onCloneCustomFormatPress,
}: Readonly<CustomFormatProps>) {
  const { id, name, specifications } = customFormat;

  const { deleteCustomFormat, isDeleting } = useDeleteCustomFormat(id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onEditPress = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const onEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const onExportPress = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const onExportModalClose = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);

  const onDeletePress = useCallback(() => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(true);
  }, []);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const onConfirmDelete = useCallback(() => {
    deleteCustomFormat();
  }, [deleteCustomFormat]);

  const onClonePress = useCallback(() => {
    onCloneCustomFormatPress(id);
  }, [id, onCloneCustomFormatPress]);

  return (
    <Card
      className={styles.customFormat}
      overlayContent={true}
      onPress={onEditPress}
    >
      <div className={styles.nameContainer}>
        <div className={styles.name}>{name}</div>

        <div className={styles.buttons}>
          <IconButton
            className={styles.cloneButton}
            title={translate('CloneCustomFormat')}
            name={icons.CLONE}
            onPress={onClonePress}
          />

          <IconButton
            className={styles.cloneButton}
            title={translate('ExportCustomFormat')}
            name={icons.EXPORT}
            onPress={onExportPress}
          />
        </div>
      </div>

      <div>
        {specifications.map((specification, index) => {
          if (!specification) {
            return null;
          }

          let kind: Kind = kinds.DEFAULT;

          if (specification.required) {
            kind = kinds.SUCCESS;
          }
          if (specification.negate) {
            kind = kinds.DANGER;
          }

          return (
            <Label key={index} className={styles.label} kind={kind}>
              {specification.name}
            </Label>
          );
        })}
      </div>

      <EditCustomFormatModal
        id={id}
        isOpen={isEditModalOpen}
        onModalClose={onEditModalClose}
        onDeleteCustomFormatPress={onDeletePress}
      />

      <ExportCustomFormatModal
        isOpen={isExportModalOpen}
        customFormat={customFormat}
        onModalClose={onExportModalClose}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteCustomFormat')}
        message={translate('DeleteCustomFormatMessageText', { name })}
        confirmLabel={translate('Delete')}
        isSpinning={isDeleting}
        onConfirm={onConfirmDelete}
        onCancel={onDeleteModalClose}
      />
    </Card>
  );
}
