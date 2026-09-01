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
import Studio, { Image } from 'Studio/Studio';
import StudioLogo from 'Studio/StudioLogo';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import { useAddNewStudioModalContent } from './useAddNewStudio';
import styles from './AddNewStudioModalContent.css';

interface AddNewStudioModalContentProps {
  studio: Studio;
  foreignId: string;
  title: string;
  images: Image[];
  onModalClose: () => void;
}

function AddNewStudioModalContent(props: AddNewStudioModalContentProps) {
  const { title, images, onModalClose, studio } = props;

  const {
    isAdding,
    isSmallScreen,
    isWindows,
    safeForWorkMode,
    settings,
    onInputChange,
    onAddStudioPress,
  } = useAddNewStudioModalContent(studio);

  const onQualityProfileIdChange = React.useCallback(
    ({ value }: EnhancedSelectInputChanged<string | number>) => {
      onInputChange({ name: 'qualityProfileId', value: Number(value) });
    },
    [onInputChange]
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{title}</ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          {!isSmallScreen && (
            <div className={styles.poster}>
              <StudioLogo
                safeForWorkMode={safeForWorkMode}
                className={styles.poster}
                images={images}
                size={250}
                overflow={true}
                lazy={true}
              />
            </div>
          )}

          <div className={styles.info}>
            <Form>
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
                  onChange={onInputChange}
                  {...settings.rootFolderPath}
                  errors={settings.rootFolderPath?.errors}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('MonitoredScene')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitored"
                  helpText={translate('MonitoredStudioHelpText')}
                  {...settings.monitored}
                  errors={settings.monitored?.errors}
                  onChange={onInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('MonitoredMovie')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="moviesMonitored"
                  helpText={translate('MonitoredStudioMovieHelpText')}
                  {...settings.moviesMonitored}
                  errors={settings.moviesMonitored?.errors}
                  onChange={onInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('MonitorNewItems')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitorNewItems"
                  {...settings.monitorNewItems}
                  errors={settings.monitorNewItems?.errors}
                  onChange={onInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('QualityProfile')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.QUALITY_PROFILE_SELECT}
                  name="qualityProfileId"
                  errors={settings.qualityProfileId?.errors}
                  onChange={onQualityProfileIdChange}
                  {...settings.qualityProfileId}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Tags')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.TAG}
                  name="tags"
                  errors={settings.tags?.errors}
                  onChange={onInputChange}
                  {...settings.tags}
                />
              </FormGroup>
            </Form>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className={styles.modalFooter}>
        <label className={styles.searchForMissingMovieLabelContainer}>
          <span className={styles.searchForMissingMovieLabel}>
            {translate('SearchOnAddStudioHelpText')}
          </span>

          <CheckInput
            containerClassName={styles.searchForMissingMovieContainer}
            className={styles.searchForMissingMovieInput}
            name="searchForMovie"
            onChange={onInputChange}
            {...settings.searchForMovie}
          />
        </label>

        <SpinnerButton
          className={styles.addButton}
          kind={kinds.SUCCESS}
          isSpinning={isAdding}
          onPress={onAddStudioPress}
        >
          {translate('AddStudio')}
        </SpinnerButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default AddNewStudioModalContent;
