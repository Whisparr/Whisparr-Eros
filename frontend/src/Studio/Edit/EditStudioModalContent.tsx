import React from 'react';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes } from 'Helpers/Props';
import type { Image } from 'Movie/Movie';
import StudioLogo from 'Studio/StudioLogo';
import type { PendingSection } from 'typings/pending';
import translate from 'Utilities/String/translate';
import styles from './EditStudioModalContent.css';

interface StudioSettings {
  monitored: boolean;
  moviesMonitored: boolean;
  afterDate?: string | null;
  qualityProfileId: number;
  minimumAvailability?: string;
  rootFolderPath: string;
  tags: number[];
  searchTitle?: string;
  searchOnAdd?: boolean;
}

interface EditStudioModalContentProps {
  studioId: number;
  title: string;
  overview?: string;
  images: Image[];
  item: PendingSection<StudioSettings>;
  isSaving: boolean;
  isPathChanging: boolean;
  isSmallScreen: boolean;
  onInputChange: (payload: { name: string; value: unknown }) => void;
  onSavePress: () => void;
  onModalClose: () => void;
  [key: string]: unknown;
}

function EditStudioModalContent(props: EditStudioModalContentProps) {
  const {
    title,
    images,
    overview,
    item,
    showMovieMonitor,
    isSaving,
    onInputChange,
    onModalClose,
    isSmallScreen,
    onSavePress,
    ...otherProps
  } = props;

  const {
    monitored,
    moviesMonitored,
    afterDate,
    qualityProfileId,
    rootFolderPath,
    tags,
    searchTitle,
    searchOnAdd,
  } = item;

  // Helper to safely get .value from item fields
  const getValue = (field: unknown, fallback: unknown) =>
    field && typeof field === 'object' && 'value' in field
      ? (field as { value: unknown }).value
      : fallback;

  function handleSavePress() {
    onSavePress();
  }

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('Edit')} - {title}
      </ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          {!isSmallScreen && (
            <div className={styles.poster}>
              <StudioLogo
                className={styles.poster}
                images={images}
                size={250}
              />
            </div>
          )}

          <div className={styles.info}>
            <div className={styles.overview}>{overview}</div>

            <Form {...otherProps}>
              <FormGroup>
                <FormLabel>{translate('MonitoredScene')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitored"
                  helpText={translate('MonitoredStudioHelpText')}
                  {...monitored}
                  onChange={onInputChange}
                />
              </FormGroup>

              {showMovieMonitor ? (
                <FormGroup>
                  <FormLabel>{translate('MonitoredMovie')}</FormLabel>
                  <FormInputGroup
                    type={inputTypes.CHECK}
                    name="moviesMonitored"
                    helpText={translate('MonitoredStudioMovieHelpText')}
                    {...moviesMonitored}
                    onChange={onInputChange}
                  />
                </FormGroup>
              ) : null}

              <FormGroup>
                <FormLabel>{translate('MonitorAfter')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.DATE}
                  name="afterDate"
                  helpText={translate('MonitorAfterStudioHelpText')}
                  {...afterDate}
                  value={getValue(afterDate, '') as string | number | string[]}
                  onChange={onInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>{translate('QualityProfile')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.QUALITY_PROFILE_SELECT}
                  helpText={translate('StudioQualityProfileHelpText')}
                  name="qualityProfileId"
                  {...qualityProfileId}
                  value={getValue(qualityProfileId, '') as string | number}
                  onChange={onInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>{translate('RootFolder')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.ROOT_FOLDER_SELECT}
                  name="rootFolderPath"
                  {...rootFolderPath}
                  value={getValue(rootFolderPath, '') as string | undefined}
                  includeMissingValue={false}
                  onChange={onInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>{translate('Tags')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.TAG}
                  name="tags"
                  onChange={onInputChange}
                  {...tags}
                  value={getValue(tags, []) as string[]}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>{translate('SearchTitle')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.TEXT}
                  name="searchTitle"
                  onChange={onInputChange}
                  {...searchTitle}
                  value={
                    getValue(searchTitle, '') as string | number | string[]
                  }
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>{translate('SearchOnAdd')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="searchOnAdd"
                  helpText={translate('SearchOnAddStudioHelpText')}
                  {...searchOnAdd}
                  value={
                    getValue(searchOnAdd, false) as
                      | string
                      | boolean
                      | null
                      | undefined
                  }
                  onChange={onInputChange}
                />
              </FormGroup>
            </Form>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Cancel')}</Button>
        <SpinnerButton isSpinning={isSaving} onPress={handleSavePress}>
          {translate('Save')}
        </SpinnerButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default EditStudioModalContent;
