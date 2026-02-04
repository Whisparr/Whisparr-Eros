import React from 'react';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { sizes } from 'Helpers/Props';
import MediaInfoType from 'typings/MediaInfo';
import translate from 'Utilities/String/translate';
import MediaInfo from './Editor/MediaInfo';

interface FileDetailsModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  mediaInfo: MediaInfoType;
}

function FileDetailsModal({
  isOpen,
  onModalClose,
  mediaInfo,
}: FileDetailsModalProps) {
  return (
    <Modal size={sizes.SMALL} isOpen={isOpen} onModalClose={onModalClose}>
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>{translate('Details')}</ModalHeader>
        <ModalBody>
          <MediaInfo {...mediaInfo} />
        </ModalBody>
        <ModalFooter>
          <Button onPress={onModalClose}>{translate('Close')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FileDetailsModal;
