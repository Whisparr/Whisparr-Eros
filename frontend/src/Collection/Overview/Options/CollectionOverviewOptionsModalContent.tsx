import React, { useCallback } from 'react';
import {
  setCollectionOverviewOption,
  useCollectionOption,
} from 'Collection/collectionOptionsStore';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { EnhancedSelectInputValue } from 'Components/Form/Select/EnhancedSelectInput';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes } from 'Helpers/Props';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';

const posterSizeOptions: EnhancedSelectInputValue<string>[] = [
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

interface CollectionOverviewOptionsModalContentProps {
  onModalClose: () => void;
}

function CollectionOverviewOptionsModalContent({
  onModalClose,
}: CollectionOverviewOptionsModalContentProps) {
  const { detailedProgressBar, size, showDetails, showOverview, showPosters } =
    useCollectionOption('overviewOptions');

  // The class this replaces mirrored every option into local state so the
  // inputs stayed responsive while the dispatch round-tripped. The store is
  // synchronous, so the store value is the only value.
  const handleChange = useCallback(({ name, value }: InputChanged) => {
    setCollectionOverviewOption({ [name]: value });
  }, []);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('CollectionOptions')}</ModalHeader>

      <ModalBody>
        <Form>
          <FormGroup>
            <FormLabel>{translate('PosterSize')}</FormLabel>

            <FormInputGroup
              type={inputTypes.SELECT}
              name="size"
              value={size}
              values={posterSizeOptions}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('DetailedProgressBar')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="detailedProgressBar"
              value={detailedProgressBar}
              helpText={translate('DetailedProgressBarHelpText')}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('ShowCollectionDetails')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="showDetails"
              value={showDetails}
              helpText={translate('CollectionShowDetailsHelpText')}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('ShowOverview')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="showOverview"
              value={showOverview}
              helpText={translate('CollectionShowOverviewsHelpText')}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('ShowPosters')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="showPosters"
              value={showPosters}
              helpText={translate('CollectionShowPostersHelpText')}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default CollectionOverviewOptionsModalContent;
