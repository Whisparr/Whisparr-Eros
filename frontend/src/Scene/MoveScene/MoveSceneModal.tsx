import React from 'react';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './MoveSceneModal.css';

export interface MoveSceneModalProps {
  originalPath?: string;
  destinationPath?: string;
  destinationRootFolder?: string;
  isOpen: boolean;
  onModalClose: () => void;
  onSavePress: () => void;
  onMoveScenePress: () => void;
}

function MoveSceneModal({
  originalPath,
  destinationPath,
  destinationRootFolder,
  isOpen,
  onModalClose,
  onSavePress,
  onMoveScenePress,
}: MoveSceneModalProps) {
  if (isOpen && !originalPath && !destinationPath && !destinationRootFolder) {
    console.error(
      'orginalPath and destinationPath OR destinationRootFolder must be provided'
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      size={sizes.MEDIUM}
      closeOnBackgroundClick={false}
      onModalClose={onModalClose}
    >
      <ModalContent showCloseButton={true} onModalClose={onModalClose}>
        <ModalHeader>{translate('MoveFiles')}</ModalHeader>

        <ModalBody>
          {destinationRootFolder
            ? translate('MoveSceneFoldersToRootFolder', {
                destinationRootFolder,
              })
            : // Only reachable through the `console.error` above, which is why
              // neither path is required. `translate` leaves a token it is not
              // given as the literal `{originalPath}`, so they are coalesced.
              translate('MoveSceneFoldersToNewPath', {
                originalPath: originalPath ?? '',
                destinationPath: destinationPath ?? '',
              })}
          {destinationRootFolder ? (
            <div>{translate('MoveSceneFoldersRenameFolderWarning')}</div>
          ) : null}
        </ModalBody>

        <ModalFooter>
          <Button className={styles.doNotMoveButton} onPress={onSavePress}>
            {translate('MoveSceneFoldersDontMoveFiles')}
          </Button>

          <Button kind={kinds.DANGER} onPress={onMoveScenePress}>
            {translate('MoveSceneFoldersMoveFiles')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default MoveSceneModal;
