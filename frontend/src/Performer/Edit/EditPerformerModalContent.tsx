import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDimensions } from 'App/appStore';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
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
import { inputTypes } from 'Helpers/Props';
import MovieHeadshot from 'Movie/MovieHeadshot';
import Performer from 'Performer/Performer';
import { useSavePerformer } from 'Performer/usePerformer';
import selectSettings from 'Store/Selectors/selectSettings';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './EditPerformerModalContent.css';

export interface EditPerformerModalContentProps {
  performer: Performer;
  showMovieMonitor: boolean;
  onModalClose: () => void;
}

function EditPerformerModalContent({
  performer,
  showMovieMonitor,
  onModalClose,
}: Readonly<EditPerformerModalContentProps>) {
  const { isSmallScreen } = useAppDimensions();
  const safeForWorkMode = useSafeForWorkMode();

  const [monitored, setMonitored] = useState(performer.monitored);
  const [moviesMonitored, setMoviesMonitored] = useState(
    performer.moviesMonitored
  );
  const [qualityProfileId, setQualityProfileId] = useState(
    performer.qualityProfileId
  );
  const [rootFolderPath, setRootFolderPath] = useState(
    performer.rootFolderPath
  );
  const [tags, setTags] = useState(performer.tags ?? []);
  const [searchOnAdd, setSearchOnAdd] = useState(performer.searchOnAdd);

  const savePerformer = useSavePerformer();

  // The fields the user has actually touched. Sent as a patch over the
  // performer on save, and handed to selectSettings so it can mark them
  // pending.
  const pendingChanges = useMemo(() => {
    const changes: Partial<Performer> = {};

    if (monitored !== performer.monitored) {
      changes.monitored = monitored;
    }

    if (moviesMonitored !== performer.moviesMonitored) {
      changes.moviesMonitored = moviesMonitored;
    }

    if (qualityProfileId !== performer.qualityProfileId) {
      changes.qualityProfileId = qualityProfileId;
    }

    if (rootFolderPath !== performer.rootFolderPath) {
      changes.rootFolderPath = rootFolderPath;
    }

    if (JSON.stringify(tags) !== JSON.stringify(performer.tags ?? [])) {
      changes.tags = tags;
    }

    if (searchOnAdd !== performer.searchOnAdd) {
      changes.searchOnAdd = searchOnAdd;
    }

    return changes;
  }, [
    monitored,
    moviesMonitored,
    qualityProfileId,
    rootFolderPath,
    tags,
    searchOnAdd,
    performer,
  ]);

  const { settings, validationErrors, validationWarnings } = useMemo(() => {
    return selectSettings(
      {
        monitored: performer.monitored,
        moviesMonitored: performer.moviesMonitored,
        qualityProfileId: performer.qualityProfileId,
        rootFolderPath: performer.rootFolderPath,
        tags: performer.tags ?? [],
        searchOnAdd: performer.searchOnAdd,
      },
      pendingChanges,
      savePerformer.error
    );
  }, [performer, pendingChanges, savePerformer.error]);

  const handleInputChange = useCallback(({ name, value }: InputChanged) => {
    switch (name) {
      case 'monitored':
        setMonitored(value as boolean);
        break;
      case 'moviesMonitored':
        setMoviesMonitored(value as boolean);
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
      case 'searchOnAdd':
        setSearchOnAdd(value as boolean);
        break;
      default:
        break;
    }
  }, []);

  const handleSavePress = useCallback(() => {
    savePerformer.mutate({ ...performer, ...pendingChanges });
  }, [savePerformer, performer, pendingChanges]);

  useEffect(() => {
    if (savePerformer.isSuccess) {
      onModalClose();
    }
  }, [savePerformer.isSuccess, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('Edit')} - {performer.fullName}
      </ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          {isSmallScreen ? null : (
            <div className={styles.poster}>
              <MovieHeadshot
                safeForWorkMode={safeForWorkMode}
                className={styles.poster}
                images={performer.images}
                size={250}
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
                  helpText={translate('MonitoredPerformerHelpText')}
                  {...settings.monitored}
                  onChange={handleInputChange}
                />
              </FormGroup>

              {showMovieMonitor ? (
                <FormGroup>
                  <FormLabel>{translate('MonitoredMovie')}</FormLabel>
                  <FormInputGroup
                    type={inputTypes.CHECK}
                    name="moviesMonitored"
                    helpText={translate('MonitoredPerformerMovieHelpText')}
                    {...settings.moviesMonitored}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              ) : null}

              <FormGroup>
                <FormLabel>{translate('QualityProfile')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.QUALITY_PROFILE_SELECT}
                  name="qualityProfileId"
                  helpText={translate('PerformerQualityProfileHelpText')}
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
                <FormLabel>{translate('SearchOnAdd')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="searchOnAdd"
                  helpText={translate('SearchOnAddPerformerHelpText')}
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
          error={savePerformer.error}
          isSpinning={savePerformer.isPending}
          onPress={handleSavePress}
        >
          {translate('Save')}
        </SpinnerErrorButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default EditPerformerModalContent;
