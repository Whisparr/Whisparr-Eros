import React from 'react';
import CheckInput from 'Components/Form/CheckInput';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds } from 'Helpers/Props';
import MovieHeadshot from 'Movie/MovieHeadshot';
import Performer from 'Performer/Performer';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import { useAddNewPerformerModalContent } from './useAddNewPerformer';
import styles from './AddNewPerformerModalContent.css';

interface AddNewPerformerModalContentProps {
  performer: Performer;
  onModalClose: () => void;
}

function AddNewPerformerModalContent({
  performer,
  onModalClose,
}: Readonly<AddNewPerformerModalContentProps>) {
  const { fullName, images } = performer;

  const {
    isAdding,
    isSmallScreen,
    isWindows,
    safeForWorkMode,
    settings,
    validationErrors,
    validationWarnings,
    onInputChange,
    onAddPerformerPress,
  } = useAddNewPerformerModalContent(performer, onModalClose);

  const {
    rootFolderPath,
    monitored,
    moviesMonitored,
    qualityProfileId,
    searchForMovie,
    tags,
  } = settings;

  const onQualityProfileIdChange = React.useCallback(
    ({ value }: EnhancedSelectInputChanged<string | number>) => {
      onInputChange({ name: 'qualityProfileId', value: Number(value) });
    },
    [onInputChange]
  );

  const onAddPerformerPressHandler = React.useCallback(() => {
    onAddPerformerPress();
  }, [onAddPerformerPress]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{fullName}</ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          {isSmallScreen ? null : (
            <div className={styles.poster}>
              <MovieHeadshot
                safeForWorkMode={safeForWorkMode}
                className={styles.poster}
                images={images ?? []}
                size={250}
                overflow={true}
                lazy={true}
                title={fullName}
              />
            </div>
          )}

          <div className={styles.info}>
            <Form
              validationErrors={validationErrors}
              validationWarnings={validationWarnings}
            >
              <FormGroup>
                <FormLabel>{translate('RootFolder')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.ROOT_FOLDER_SELECT}
                  name="rootFolderPath"
                  valueOptions={{
                    isWindows,
                  }}
                  selectedValueOptions={{
                    isWindows,
                  }}
                  {...rootFolderPath}
                  onChange={onInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('MonitoredScene')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitored"
                  helpText={translate('MonitoredPerformerHelpText')}
                  {...monitored}
                  onChange={onInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('MonitoredMovie')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="moviesMonitored"
                  helpText={translate('MonitoredPerformerMovieHelpText')}
                  {...moviesMonitored}
                  onChange={onInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('QualityProfile')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.QUALITY_PROFILE_SELECT}
                  name="qualityProfileId"
                  {...qualityProfileId}
                  onChange={onQualityProfileIdChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Tags')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.TAG}
                  name="tags"
                  {...tags}
                  onChange={onInputChange}
                />
              </FormGroup>
            </Form>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className={styles.modalFooter}>
        <label className={styles.searchForMissingMovieLabelContainer}>
          <span className={styles.searchForMissingMovieLabel}>
            {translate('SearchOnAddPerformerHelpText')}
          </span>

          <CheckInput
            containerClassName={styles.searchForMissingMovieContainer}
            className={styles.searchForMissingMovieInput}
            name="searchForMovie"
            onChange={onInputChange}
            {...searchForMovie}
          />
        </label>

        <SpinnerButton
          className={styles.addButton}
          kind={kinds.SUCCESS}
          isSpinning={isAdding}
          onPress={onAddPerformerPressHandler}
        >
          {translate('AddPerformer')}
        </SpinnerButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default AddNewPerformerModalContent;
