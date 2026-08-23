import React, { useState } from 'react';
import Alert from 'Components/Alert';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface QualityOption {
  id: number;
  name: string;
}

interface LanguageOption {
  id: number;
  name: string;
}

interface FileEditModalContentState {
  qualityId: string;
  languageIds: string[];
  indexerFlags: number;
  proper: boolean;
  real: boolean;
  edition: string;
  releaseGroup: string;
}

interface FileEditModalContentProps {
  qualityId: number;
  proper: boolean;
  real: boolean;
  relativePath: string;
  edition: string;
  releaseGroup: string;
  languageIds: number[];
  languages: LanguageOption[];
  indexerFlags: number;
  isFetching: boolean;
  isPopulated: boolean;
  error?: object;
  qualities: QualityOption[];
  onSaveInputs: (state: FileEditModalContentState) => void;
  onModalClose: () => void;
}

function FileEditModalContent(props: FileEditModalContentProps) {
  const [state, setState] = useState<FileEditModalContentState>({
    qualityId: props.qualityId.toString(),
    languageIds: props.languageIds.map((id) => id.toString()),
    indexerFlags: props.indexerFlags,
    proper: props.proper,
    real: props.real,
    edition: props.edition,
    releaseGroup: props.releaseGroup,
  });

  // Use correct types for EnhancedSelectInputValue<number>
  const qualityOptions: import('Components/Form/Select/EnhancedSelectInput').EnhancedSelectInputValue<number>[] =
    props.qualities.map(({ id, name }) => ({ key: id, value: name }));
  const languageOptions: import('Components/Form/Select/EnhancedSelectInput').EnhancedSelectInputValue<number>[] =
    props.languages.map(({ id, name }) => ({ key: id, value: name }));

  // Handler for quality select (single value)
  const handleQualityChange = React.useCallback(
    (change: import('typings/inputs').EnhancedSelectInputChanged<number>) => {
      setState((prev) => ({ ...prev, qualityId: change.value.toString() }));
    },
    []
  );

  // Handler for language select (multi value). The input's value type covers
  // the UI settings page too, which picks a single language, so the array is
  // narrowed here rather than assumed.
  const handleLanguageChange = React.useCallback(
    (
      change: import('typings/inputs').EnhancedSelectInputChanged<
        number | number[]
      >
    ) => {
      const languageIds = Array.isArray(change.value)
        ? change.value
        : [change.value];

      setState((prev) => ({ ...prev, languageIds: languageIds.map(String) }));
    },
    []
  );

  // Handler for checkboxes and text inputs
  const handleInputChange = React.useCallback(
    <T,>(change: import('typings/inputs').InputChanged<T>) => {
      setState((prev) => ({ ...prev, [change.name]: change.value }));
    },
    []
  );

  // Handler for indexer flags
  const handleIndexerFlagsChange = React.useCallback(
    (change: import('typings/inputs').EnhancedSelectInputChanged<number>) => {
      setState((prev) => ({ ...prev, indexerFlags: change.value }));
    },
    []
  );

  const handleSaveInputs = React.useCallback(() => {
    props.onSaveInputs({
      ...state,
      qualityId: state.qualityId,
      languageIds: state.languageIds,
    });
  }, [props, state]);

  return (
    <ModalContent onModalClose={props.onModalClose}>
      <ModalHeader>
        {translate('EditMovieFile')} - {props.relativePath}
      </ModalHeader>
      <ModalBody>
        {props.isFetching && <LoadingIndicator />}
        {!props.isFetching && !!props.error && (
          <Alert kind={kinds.DANGER}>{translate('QualitiesLoadError')}</Alert>
        )}
        {props.isPopulated && !props.error && (
          <Form>
            <FormGroup>
              <FormLabel>{translate('Quality')}</FormLabel>
              <FormInputGroup
                type={inputTypes.SELECT}
                name="qualityId"
                value={Number(state.qualityId)}
                values={qualityOptions}
                onChange={handleQualityChange}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>{translate('Proper')}</FormLabel>
              <FormInputGroup
                type={inputTypes.CHECK}
                name="proper"
                value={state.proper}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>{translate('Real')}</FormLabel>
              <FormInputGroup
                type={inputTypes.CHECK}
                name="real"
                value={state.real}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>{translate('Languages')}</FormLabel>
              <FormInputGroup<number[], 'languageSelect'>
                type={inputTypes.LANGUAGE_SELECT}
                name="languageIds"
                value={state.languageIds.map(Number)}
                values={languageOptions}
                onChange={handleLanguageChange}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>{translate('IndexerFlags')}</FormLabel>
              <FormInputGroup
                type={inputTypes.INDEXER_FLAGS_SELECT}
                name="indexerFlags"
                indexerFlags={state.indexerFlags}
                onChange={handleIndexerFlagsChange}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>{translate('Edition')}</FormLabel>
              <FormInputGroup
                type={inputTypes.TEXT}
                name="edition"
                value={state.edition}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>{translate('ReleaseGroup')}</FormLabel>
              <FormInputGroup
                type={inputTypes.TEXT}
                name="releaseGroup"
                value={state.releaseGroup}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button onPress={props.onModalClose}>{translate('Cancel')}</Button>
        <Button kind={kinds.SUCCESS} onPress={handleSaveInputs}>
          {translate('Save')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default FileEditModalContent;
