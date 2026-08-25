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
import PosterOptionsForm from 'Components/PosterOptionsForm';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import {
  setSceneIndexPosterOption,
  useSceneIndexOption,
} from '../../sceneIndexOptionsStore';

interface SceneIndexPosterOptionsModalContentProps {
  onModalClose(...args: unknown[]): unknown;
}

function SceneIndexPosterOptionsModalContent({
  onModalClose,
}: Readonly<SceneIndexPosterOptionsModalContentProps>) {
  const posterOptions = useSceneIndexOption('posterOptions');

  const onPosterOptionChange = useCallback(
    ({ name, value }: { name: string; value: unknown }) => {
      setSceneIndexPosterOption({ [name]: value });
    },
    []
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('PosterOptions')}</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <FormLabel>{translate('TablePageSize')}</FormLabel>
            <FormInputGroup
              type={inputTypes.NUMBER}
              name="pageSize"
              value={posterOptions.pageSize}
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
  );
}

export default SceneIndexPosterOptionsModalContent;
