import React, { useCallback } from 'react';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes } from 'Helpers/Props';
import {
  setStudioIndexPosterOption,
  StudioIndexPosterOptions,
  useStudioIndexOption,
} from 'Studio/Index/studioIndexOptionsStore';
import translate from 'Utilities/String/translate';

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

interface StudioIndexPosterOptionsModalContentProps {
  onModalClose(...args: unknown[]): unknown;
}

function StudioIndexPosterOptionsModalContent(
  props: StudioIndexPosterOptionsModalContentProps
) {
  const { onModalClose } = props;

  const posterOptions = useStudioIndexOption('posterOptions');

  const { detailedProgressBar, pageSize, size, showTitle } = posterOptions;

  const onPosterOptionChange = useCallback(
    ({ name, value }: { name: string; value: unknown }) => {
      setStudioIndexPosterOption({
        [name]: value,
      } as Partial<StudioIndexPosterOptions>);
    },
    []
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('PosterOptions')}</ModalHeader>

      <ModalBody>
        <Form>
          <FormGroup>
            <FormLabel>{translate('PosterSize')}</FormLabel>

            <FormInputGroup
              type={inputTypes.SELECT}
              name="size"
              value={size}
              values={posterSizeOptions}
              onChange={onPosterOptionChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('TablePageSize')}</FormLabel>
            <FormInputGroup
              type={inputTypes.NUMBER}
              name="pageSize"
              value={pageSize}
              min={10}
              max={1000}
              helpText={translate('TablePageSizeHelpText')}
              helpTextWarning={translate('TablePageSizeMinMaxHelpText', {
                min: 10,
                max: 1000,
              })}
              onChange={onPosterOptionChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('DetailedProgressBar')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="detailedProgressBar"
              value={detailedProgressBar}
              helpText={translate('DetailedProgressBarHelpText')}
              onChange={onPosterOptionChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('ShowTitle')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="showTitle"
              value={showTitle}
              helpText={translate('ShowStudioTitleHelpText')}
              onChange={onPosterOptionChange}
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

export default StudioIndexPosterOptionsModalContent;
