import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'Components/Modal/Modal';
import AddNewMovieModalContent from './AddNewMovieModalContent';

function AddNewMovieModal(props) {
  const {
    isOpen,
    item,
    onModalClose
  } = props;

  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      <AddNewMovieModalContent
        item={item}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

AddNewMovieModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default AddNewMovieModal;
