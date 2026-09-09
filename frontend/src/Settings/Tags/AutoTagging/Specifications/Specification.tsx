import React, { useCallback, useState } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { icons, kinds } from 'Helpers/Props';
import { AutoTaggingSpecification } from 'typings/AutoTagging';
import translate from 'Utilities/String/translate';
import EditSpecificationModal from './EditSpecificationModal';
import styles from './Specification.css';

interface SpecificationProps {
  specification: AutoTaggingSpecification;
  onSaveSpecification: (specification: AutoTaggingSpecification) => void;
  onConfirmDeleteSpecification: (specificationId: number) => void;
  onCloneSpecificationPress: (specificationId: number) => void;
}

export default function Specification({
  specification,
  onSaveSpecification,
  onConfirmDeleteSpecification,
  onCloneSpecificationPress,
}: Readonly<SpecificationProps>) {
  const { id, implementationName, name, negate, required } = specification;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onEditPress = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const onEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const onDeletePress = useCallback(() => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(true);
  }, []);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const onConfirmDelete = useCallback(() => {
    onConfirmDeleteSpecification(id);
  }, [id, onConfirmDeleteSpecification]);

  const onClonePress = useCallback(() => {
    onCloneSpecificationPress(id);
  }, [id, onCloneSpecificationPress]);

  return (
    <Card
      className={styles.autoTagging}
      overlayContent={true}
      aria-label={translate('EditConditionImplementation', {
        implementationName,
      })}
      onPress={onEditPress}
    >
      <div className={styles.nameContainer}>
        <div className={styles.name}>{name}</div>

        <IconButton
          className={styles.cloneButton}
          title={translate('Clone')}
          name={icons.CLONE}
          onPress={onClonePress}
        />
      </div>

      <div className={styles.labels}>
        <Label kind={kinds.DEFAULT}>{implementationName}</Label>

        {negate ? (
          <Label kind={kinds.DANGER}>{translate('Negated')}</Label>
        ) : null}

        {required ? (
          <Label kind={kinds.SUCCESS}>{translate('Required')}</Label>
        ) : null}
      </div>

      <EditSpecificationModal
        isOpen={isEditModalOpen}
        specification={specification}
        onSave={onSaveSpecification}
        onDeleteSpecificationPress={onDeletePress}
        onModalClose={onEditModalClose}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteSpecification')}
        message={translate('DeleteSpecificationHelpText', { name })}
        confirmLabel={translate('Delete')}
        onConfirm={onConfirmDelete}
        onCancel={onDeleteModalClose}
      />
    </Card>
  );
}
