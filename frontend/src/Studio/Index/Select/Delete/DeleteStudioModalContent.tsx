import React, { Component } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import InfoLabel from 'Components/InfoLabel';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './DeleteStudioModal.css';

interface DeleteStudioModalContentProps {
  studioIds?: number[];
  onDeletePress: (deleteFiles: boolean, addImportExclusion: boolean) => void;
  onModalClose: () => void;
}

interface DeleteStudioModalContentState {
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

class DeleteStudioModalContent extends Component<
  DeleteStudioModalContentProps,
  DeleteStudioModalContentState
> {
  state: DeleteStudioModalContentState = {
    deleteFiles: false,
    addImportExclusion: false,
  };

  onDeleteOptionChange = ({ value }: { value: boolean }) => {
    this.setState({ addImportExclusion: value });
  };

  onDeleteFilesChange = ({ value }: { value: boolean }) => {
    this.setState({ deleteFiles: value });
  };

  onDeleteStudioConfirmed = () => {
    const { deleteFiles, addImportExclusion } = this.state;
    this.props.onDeletePress(deleteFiles, addImportExclusion);
  };

  render() {
    const { onModalClose } = this.props;
    const { deleteFiles, addImportExclusion } = this.state;
    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>{translate('DeleteStudiosModalHeader')}</ModalHeader>
        <ModalBody>
          <FormGroup>
            <InfoLabel
              name=""
              size={sizes.LARGE}
              className={styles.warningText}
            >
              {translate('DeleteStudiosModalWarning')}
            </InfoLabel>
          </FormGroup>
          <FormGroup>
            <FormLabel>{translate('AddImportListExclusion')}</FormLabel>
            <FormInputGroup
              type={inputTypes.CHECK}
              name="addImportExclusion"
              value={addImportExclusion}
              helpText={translate('AddImportExclusionHelpText')}
              kind={kinds.DANGER}
              onChange={this.onDeleteOptionChange}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>
              {translate('DeleteFiles', { all: translate('All') })}
            </FormLabel>
            <FormInputGroup
              type={inputTypes.CHECK}
              name="deleteFiles"
              value={deleteFiles}
              helpText={translate('DeleteFilesHelpText')}
              kind={kinds.DANGER}
              onChange={this.onDeleteFilesChange}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onModalClose}>{translate('Close')}</Button>
          <Button kind={kinds.DANGER} onPress={this.onDeleteStudioConfirmed}>
            {translate('Delete')}
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  }
}

export default DeleteStudioModalContent;
