import React, { useCallback } from 'react';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import {
  setPerformerDetailsPosterOption,
  usePerformerDetailsOption,
} from './performerDetailsOptionsStore';

const posterSizeOptions = [
  {
    key: 'small',
    get value() {
      return translate('Small');
    },
  },
  {
    key: 'medium',
    get value() {
      return translate('Medium');
    },
  },
  {
    key: 'large',
    get value() {
      return translate('Large');
    },
  },
];

const posterInfoOptions = [
  {
    key: 'studio',
    get value() {
      return translate('Studio');
    },
  },
  {
    key: 'year',
    get value() {
      return translate('Year');
    },
  },
  {
    key: 'releaseDate',
    get value() {
      return translate('ReleaseDate');
    },
  },
  {
    key: 'added',
    get value() {
      return translate('Added');
    },
  },
  {
    key: 'qualityProfileId',
    get value() {
      return translate('QualityProfile');
    },
  },
  {
    key: 'path',
    get value() {
      return translate('Path');
    },
  },
  {
    key: 'sizeOnDisk',
    get value() {
      return translate('SizeOnDisk');
    },
  },
  {
    key: 'originalLanguage',
    get value() {
      return translate('OriginalLanguage');
    },
  },
];

interface PerformerDetailsPosterOptionsModalProps {
  isOpen: boolean;
  onModalClose(...args: unknown[]): unknown;
}

function PerformerDetailsPosterOptionsModal({
  isOpen,
  onModalClose,
}: PerformerDetailsPosterOptionsModalProps) {
  const posterOptions = usePerformerDetailsOption('posterOptions');

  const onPosterOptionChange = useCallback(
    ({ name, value }: { name: string; value: unknown }) => {
      setPerformerDetailsPosterOption({ [name]: value });
    },
    []
  );

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>{translate('PosterOptions')}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <FormLabel>{translate('PosterSize')}</FormLabel>
              <FormInputGroup
                type={inputTypes.SELECT}
                name="size"
                value={posterOptions.size}
                values={posterSizeOptions}
                onChange={onPosterOptionChange}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>{translate('Info')}</FormLabel>
              <FormInputGroup
                type={inputTypes.SELECT}
                name="info"
                value={posterOptions.info}
                values={posterInfoOptions}
                onChange={onPosterOptionChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onModalClose}>{translate('Close')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default PerformerDetailsPosterOptionsModal;
