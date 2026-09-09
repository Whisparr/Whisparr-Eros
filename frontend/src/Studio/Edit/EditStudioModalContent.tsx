import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDimensions } from 'App/appStore';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { useMovieMonitorAvailability } from 'Helpers/Hooks/useMovieMonitorAvailability';
import { inputTypes } from 'Helpers/Props';
import selectSettings from 'Helpers/selectSettings';
import Studio from 'Studio/Studio';
import StudioLogo from 'Studio/StudioLogo';
import { useSaveStudio } from 'Studio/useStudio';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './EditStudioModalContent.css';

export interface EditStudioModalContentProps {
  studio: Studio;
  onModalClose: () => void;
}

function EditStudioModalContent({
  studio,
  onModalClose,
}: Readonly<EditStudioModalContentProps>) {
  const { isSmallScreen } = useAppDimensions();

  const [monitored, setMonitored] = useState(studio.monitored);
  const [moviesMonitored, setMoviesMonitored] = useState(
    studio.moviesMonitored
  );
  const [whisparrMonitorNewItems, setWhisparrMonitorNewItems] = useState(
    studio.whisparrMonitorNewItems
  );
  const [afterDate, setAfterDate] = useState(studio.afterDate ?? '');
  const [qualityProfileId, setQualityProfileId] = useState(
    studio.qualityProfileId
  );
  const [rootFolderPath, setRootFolderPath] = useState(studio.rootFolderPath);
  const [tags, setTags] = useState(studio.tags ?? []);
  const [searchTitle, setSearchTitle] = useState(studio.searchTitle ?? '');
  const [searchOnAdd, setSearchOnAdd] = useState(studio.searchOnAdd);

  const saveStudio = useSaveStudio();

  // The fields the user has actually touched. Sent as a patch over the studio
  // on save, and handed to selectSettings so it can mark them pending.
  const pendingChanges = useMemo(() => {
    const changes: Partial<Studio> = {};

    if (monitored !== studio.monitored) {
      changes.monitored = monitored;
    }

    if (moviesMonitored !== studio.moviesMonitored) {
      changes.moviesMonitored = moviesMonitored;
    }

    if (whisparrMonitorNewItems !== studio.whisparrMonitorNewItems) {
      changes.whisparrMonitorNewItems = whisparrMonitorNewItems;
    }

    if (afterDate !== (studio.afterDate ?? '')) {
      changes.afterDate = afterDate;
    }

    if (qualityProfileId !== studio.qualityProfileId) {
      changes.qualityProfileId = qualityProfileId;
    }

    if (rootFolderPath !== studio.rootFolderPath) {
      changes.rootFolderPath = rootFolderPath;
    }

    if (JSON.stringify(tags) !== JSON.stringify(studio.tags ?? [])) {
      changes.tags = tags;
    }

    if (searchTitle !== (studio.searchTitle ?? '')) {
      changes.searchTitle = searchTitle;
    }

    if (searchOnAdd !== studio.searchOnAdd) {
      changes.searchOnAdd = searchOnAdd;
    }

    return changes;
  }, [
    monitored,
    moviesMonitored,
    whisparrMonitorNewItems,
    afterDate,
    qualityProfileId,
    rootFolderPath,
    tags,
    searchTitle,
    searchOnAdd,
    studio,
  ]);

  const { settings, validationErrors, validationWarnings } = useMemo(() => {
    return selectSettings(
      {
        monitored: studio.monitored,
        moviesMonitored: studio.moviesMonitored,
        whisparrMonitorNewItems: studio.whisparrMonitorNewItems,
        afterDate: studio.afterDate ?? '',
        qualityProfileId: studio.qualityProfileId,
        rootFolderPath: studio.rootFolderPath,
        tags: studio.tags ?? [],
        searchTitle: studio.searchTitle ?? '',
        searchOnAdd: studio.searchOnAdd,
      },
      pendingChanges,
      saveStudio.error
    );
  }, [studio, pendingChanges, saveStudio.error]);

  // Movie monitoring only means something when the metadata source can supply
  // movies at all, so the toggle follows the configured source. When the
  // source is set but this studio isn't linked to it on stashdb.org the toggle
  // stays visible and disabled, with the reason underneath it.
  const {
    isSupported: isMovieMonitorSupported,
    isLinked: isMovieMonitorLinked,
    unavailableMessage: movieMonitorUnavailableMessage,
  } = useMovieMonitorAvailability('studio', studio.tmdbId, studio.tpdbId);

  // A studio can already be monitored and later lose its link, so leave the
  // toggle usable in that direction — otherwise there'd be no way to clear a
  // value the server now rejects on every save.
  const isMovieMonitorDisabled = !isMovieMonitorLinked && !moviesMonitored;

  const handleInputChange = useCallback(({ name, value }: InputChanged) => {
    switch (name) {
      case 'monitored':
        setMonitored(value as boolean);
        break;
      case 'moviesMonitored':
        setMoviesMonitored(value as boolean);
        break;
      case 'whisparrMonitorNewItems':
        setWhisparrMonitorNewItems(value as boolean);
        break;
      case 'afterDate':
        setAfterDate(value as string);
        break;
      case 'qualityProfileId':
        setQualityProfileId(value as number);
        break;
      case 'rootFolderPath':
        setRootFolderPath(value as string);
        break;
      case 'tags':
        setTags(value as number[]);
        break;
      case 'searchTitle':
        setSearchTitle(value as string);
        break;
      case 'searchOnAdd':
        setSearchOnAdd(value as boolean);
        break;
      default:
        break;
    }
  }, []);

  const handleSavePress = useCallback(() => {
    saveStudio.mutate({ ...studio, ...pendingChanges });
  }, [saveStudio, studio, pendingChanges]);

  useEffect(() => {
    if (saveStudio.isSuccess) {
      onModalClose();
    }
  }, [saveStudio.isSuccess, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('Edit')} - {studio.title}
      </ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          {isSmallScreen ? null : (
            <div className={styles.poster}>
              <StudioLogo
                className={styles.poster}
                images={studio.images}
                size={250}
                title={studio.title}
              />
            </div>
          )}

          <div className={styles.info}>
            <Form
              validationErrors={validationErrors}
              validationWarnings={validationWarnings}
            >
              <FormGroup>
                <FormLabel>{translate('MonitoredScene')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitored"
                  helpText={translate('MonitoredStudioHelpText')}
                  {...settings.monitored}
                  onChange={handleInputChange}
                />
              </FormGroup>

              {isMovieMonitorSupported ? (
                <FormGroup>
                  <FormLabel>{translate('MonitoredMovie')}</FormLabel>
                  <FormInputGroup
                    type={inputTypes.CHECK}
                    name="moviesMonitored"
                    helpText={translate('MonitoredStudioMovieHelpText')}
                    helpTextWarning={movieMonitorUnavailableMessage}
                    isDisabled={isMovieMonitorDisabled}
                    {...settings.moviesMonitored}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              ) : null}

              <FormGroup>
                <FormLabel>{translate('WhisparrMonitorNewItems')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="whisparrMonitorNewItems"
                  helpText={translate('WhisparrMonitorNewItemsEntityHelpText')}
                  {...settings.whisparrMonitorNewItems}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('MonitorAfter')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.DATE}
                  name="afterDate"
                  helpText={translate('MonitorAfterStudioHelpText')}
                  {...settings.afterDate}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('QualityProfile')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.QUALITY_PROFILE_SELECT}
                  name="qualityProfileId"
                  helpText={translate('StudioQualityProfileHelpText')}
                  {...settings.qualityProfileId}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('RootFolder')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.ROOT_FOLDER_SELECT}
                  name="rootFolderPath"
                  {...settings.rootFolderPath}
                  includeMissingValue={false}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Tags')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.TAG}
                  name="tags"
                  {...settings.tags}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('SearchTitle')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.TEXT}
                  name="searchTitle"
                  {...settings.searchTitle}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('SearchOnAdd')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="searchOnAdd"
                  helpText={translate('SearchOnAddStudioHelpText')}
                  {...settings.searchOnAdd}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Form>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <SpinnerErrorButton
          error={saveStudio.error}
          isSpinning={saveStudio.isPending}
          onPress={handleSavePress}
        >
          {translate('Save')}
        </SpinnerErrorButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default EditStudioModalContent;
