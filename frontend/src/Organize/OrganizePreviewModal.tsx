import React from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import OrganizePreviewModalContent, {
  OrganizePreviewModalContentProps,
} from './OrganizePreviewModalContent';

type OrganizePreviewModalProps = OrganizePreviewModalContentProps & {
  isOpen: boolean;
};

function OrganizePreviewModal({
  isOpen,
  ...otherProps
}: Readonly<OrganizePreviewModalProps>) {
  const { onModalClose } = otherProps;

  return (
    <Modal
      isOpen={isOpen}
      size={sizes.EXTRA_EXTRA_LARGE}
      onModalClose={onModalClose}
    >
      {isOpen ? <OrganizePreviewModalContent {...otherProps} /> : null}
    </Modal>
  );
}

export default OrganizePreviewModal;
