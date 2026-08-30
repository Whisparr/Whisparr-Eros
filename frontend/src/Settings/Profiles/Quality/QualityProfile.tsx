import React, { useCallback } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import Tooltip from 'Components/Tooltip/Tooltip';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import { QualityProfileItem } from 'typings/QualityProfile';
import translate from 'Utilities/String/translate';
import EditQualityProfileModal from './EditQualityProfileModal';
import { useDeleteQualityProfile } from './useQualityProfiles';
import styles from './QualityProfile.css';

interface QualityProfileProps {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  fallback: boolean;
  cutoff: number;
  items: QualityProfileItem[];
  onCloneQualityProfilePress: (id: number) => void;
}

function QualityProfile({
  id,
  name,
  upgradeAllowed,
  fallback,
  cutoff,
  items,
  onCloneQualityProfilePress,
}: Readonly<QualityProfileProps>) {
  const { deleteQualityProfile, isDeleting } = useDeleteQualityProfile(id);

  const [
    isEditQualityProfileModalOpen,
    setEditQualityProfileModalOpen,
    setEditQualityProfileModalClosed,
  ] = useModalOpenState(false);

  const [
    isDeleteQualityProfileModalOpen,
    setDeleteQualityProfileModalOpen,
    setDeleteQualityProfileModalClosed,
  ] = useModalOpenState(false);

  const handleDeleteQualityProfilePress = useCallback(() => {
    setEditQualityProfileModalClosed();
    setDeleteQualityProfileModalOpen();
  }, [setEditQualityProfileModalClosed, setDeleteQualityProfileModalOpen]);

  const handleConfirmDeleteQualityProfile = useCallback(() => {
    deleteQualityProfile();
  }, [deleteQualityProfile]);

  const handleCloneQualityProfilePress = useCallback(() => {
    onCloneQualityProfilePress(id);
  }, [id, onCloneQualityProfilePress]);

  return (
    <Card
      className={styles.qualityProfile}
      overlayContent={true}
      onPress={setEditQualityProfileModalOpen}
    >
      <div className={styles.nameContainer}>
        <div className={styles.name}>{name}</div>

        <IconButton
          className={styles.cloneButton}
          title={translate('CloneProfile')}
          name={icons.CLONE}
          onPress={handleCloneQualityProfilePress}
        />
      </div>

      <div className={styles.qualities}>
        {items.map((item) => {
          if (!item.allowed) {
            return null;
          }

          if (item.quality) {
            const isCutoff = upgradeAllowed && item.quality.id === cutoff;

            return (
              <Label
                key={item.quality.id}
                kind={isCutoff ? kinds.INFO : kinds.DEFAULT}
                title={
                  isCutoff
                    ? translate('UpgradeUntilThisQualityIsMetOrExceeded')
                    : undefined
                }
              >
                {item.quality.name}
              </Label>
            );
          }

          const isCutoff = upgradeAllowed && item.id === cutoff;

          return (
            <Tooltip
              key={item.id}
              className={styles.tooltipLabel}
              anchor={
                <Label
                  kind={isCutoff ? kinds.INFO : kinds.DEFAULT}
                  title={isCutoff ? translate('Cutoff') : undefined}
                >
                  {item.name}
                </Label>
              }
              tooltip={
                <div>
                  {item.items.map((groupItem) => {
                    return (
                      <Label
                        key={groupItem.quality.id}
                        kind={isCutoff ? kinds.INFO : kinds.DEFAULT}
                        title={isCutoff ? translate('Cutoff') : undefined}
                      >
                        {groupItem.quality.name}
                      </Label>
                    );
                  })}
                </div>
              }
              kind={kinds.INVERSE}
              position={tooltipPositions.TOP}
            />
          );
        })}
      </div>

      {fallback ? (
        <div className={styles.fallback}>
          <Label>{translate('Fallback')}</Label>
        </div>
      ) : null}

      <EditQualityProfileModal
        id={id}
        isOpen={isEditQualityProfileModalOpen}
        onDeleteQualityProfilePress={handleDeleteQualityProfilePress}
        onModalClose={setEditQualityProfileModalClosed}
      />

      <ConfirmModal
        isOpen={isDeleteQualityProfileModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteQualityProfile')}
        message={translate('DeleteQualityProfileMessageText', { name })}
        confirmLabel={translate('Delete')}
        isSpinning={isDeleting}
        onConfirm={handleConfirmDeleteQualityProfile}
        onCancel={setDeleteQualityProfileModalClosed}
      />
    </Card>
  );
}

export default QualityProfile;
