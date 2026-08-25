import React from 'react';
import Form from 'Components/Form/Form';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import PosterOptionsForm, {
  CommonPosterOptions,
  PosterOptionChange,
} from 'Components/PosterOptionsForm';
import translate from 'Utilities/String/translate';

interface DetailsPosterOptionsModalProps {
  isOpen: boolean;
  posterOptions: CommonPosterOptions;
  onModalClose(...args: unknown[]): unknown;
  onPosterOptionChange(change: PosterOptionChange): void;
}

function DetailsPosterOptionsModal({
  isOpen,
  posterOptions,
  onModalClose,
  onPosterOptionChange,
}: Readonly<DetailsPosterOptionsModalProps>) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>{translate('PosterOptions')}</ModalHeader>
        <ModalBody>
          <Form>
            <PosterOptionsForm
              posterOptions={posterOptions}
              onPosterOptionChange={onPosterOptionChange}
            />
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onModalClose}>{translate('Close')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default DetailsPosterOptionsModal;
