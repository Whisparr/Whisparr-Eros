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
import { useMovieMonitorAvailability } from 'Helpers/Hooks/useMovieMonitorAvailability';
import { inputTypes } from 'Helpers/Props';
import selectSettings from 'Helpers/selectSettings';
import MovieHeadshot from 'Movie/MovieHeadshot';
import Performer from 'Performer/Performer';
import { useSavePerformer } from 'Performer/usePerformer';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './EditPerformerModalContent.module.css';

export interface EditPerformerModalContentProps {
  performer: Performer;
  onModalClose: () => void;
}

function EditPerformerModalContent({
  performer,
  onModalClose,
}: Readonly<EditPerformerModalContentProps>) {
  const { isSmallScreen } = useAppDimensions();
  const safeForWorkMode = useSafeForWorkMode();

  const [visible, setVisible] = useState(performer.visibility !== 'hidden');
  const [monitored, setMonitored] = useState(performer.monitored);
  const [moviesMonitored, setMoviesMonitored] = useState(
    performer.moviesMonitored
  );
  const [whisparrMonitorNewItems, setWhisparrMonitorNewItems] = useState(
    performer.whisparrMonitorNewItems
  );
  const [qualityProfileId, setQualityProfileId] = useState(
    performer.qualityProfileId
  );
  const [rootFolderPath, setRootFolderPath] = useState(
    performer.rootFolderPath
  );
  const [afterDate, setAfterDate] = useState(performer.afterDate ?? '');
  const [tags, setTags] = useState(performer.tags ?? []);
  const [searchOnAdd, setSearchOnAdd] = useState(performer.searchOnAdd);

  const savePerformer = useSavePerformer();

  // The fields the user has actually touched. Sent as a patch over the
  // performer on save, and handed to selectSettings so it can mark them
  // pending.
  const pendingChanges = useMemo(() => {
    const changes: Partial<Performer> & { visible?: boolean } = {};

    if (visible !== (performer.visibility !== 'hidden')) {
      changes.visible = visible;
    }

    if (monitored !== performer.monitored) {
      changes.monitored = monitored;
    }

    if (moviesMonitored !== performer.moviesMonitored) {
      changes.moviesMonitored = moviesMonitored;
    }

    if (whisparrMonitorNewItems !== performer.whisparrMonitorNewItems) {
      changes.whisparrMonitorNewItems = whisparrMonitorNewItems;
    }

    if (qualityProfileId !== performer.qualityProfileId) {
      changes.qualityProfileId = qualityProfileId;
    }

    if (rootFolderPath !== performer.rootFolderPath) {
      changes.rootFolderPath = rootFolderPath;
    }

    if (afterDate !== (performer.afterDate ?? '')) {
      changes.afterDate = afterDate;
    }

    if (JSON.stringify(tags) !== JSON.stringify(performer.tags ?? [])) {
      changes.tags = tags;
    }

    if (searchOnAdd !== performer.searchOnAdd) {
      changes.searchOnAdd = searchOnAdd;
    }

    return changes;
  }, [
    visible,
    monitored,
    moviesMonitored,
    whisparrMonitorNewItems,
    qualityProfileId,
    rootFolderPath,
    afterDate,
    tags,
    searchOnAdd,
    performer,
  ]);

  const { settings, validationErrors, validationWarnings } = useMemo(() => {
    return selectSettings(
      {
        visible: performer.visibility !== 'hidden',
        monitored: performer.monitored,
        moviesMonitored: performer.moviesMonitored,
        whisparrMonitorNewItems: performer.whisparrMonitorNewItems,
        qualityProfileId: performer.qualityProfileId,
        rootFolderPath: performer.rootFolderPath,
        afterDate: performer.afterDate ?? '',
        tags: performer.tags ?? [],
        searchOnAdd: performer.searchOnAdd,
      },
      pendingChanges,
      savePerformer.error
    );
  }, [performer, pendingChanges, savePerformer.error]);

  // Movie monitoring only means something when the metadata source can supply
  // movies at all, so the toggle follows the configured source. When the
  // source is set but this performer isn't linked to it on stashdb.org the
  // toggle stays visible and disabled, with the reason underneath it.
  const {
    isSupported: isMovieMonitorSupported,
    isLinked: isMovieMonitorLinked,
    unavailableMessage: movieMonitorUnavailableMessage,
  } = useMovieMonitorAvailability(
    'performer',
    performer.tmdbId,
    performer.tpdbId
  );

  // A performer can already be monitored and later lose their link, so leave
  // the toggle usable in that direction — otherwise there'd be no way to clear
  // a value the server now rejects on every save.
  const isMovieMonitorDisabled = !isMovieMonitorLinked && !moviesMonitored;

  // Mirrors the server: hiding a performer unmonitors them, and monitoring a
  // hidden performer makes them visible.
  const handleInputChange = useCallback(({ name, value }: InputChanged) => {
    switch (name) {
      case 'visible':
        setVisible(value as boolean);

        if (!value) {
          setMonitored(false);
          setMoviesMonitored(false);
        }

        break;
      case 'monitored':
        setMonitored(value as boolean);

        if (value) {
          setVisible(true);
        }

        break;
      case 'moviesMonitored':
        setMoviesMonitored(value as boolean);

        if (value) {
          setVisible(true);
        }

        break;
      case 'whisparrMonitorNewItems':
        setWhisparrMonitorNewItems(value as boolean);
        break;
      case 'qualityProfileId':
        setQualityProfileId(value as number);
        break;
      case 'rootFolderPath':
        setRootFolderPath(value as string);
        break;
      case 'afterDate':
        setAfterDate(value as string);
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
    const { visible: pendingVisible, ...changes } = pendingChanges;

    savePerformer.mutate({
      ...performer,
      ...changes,
      ...(pendingVisible === undefined
        ? {}
        : { visibility: pendingVisible ? 'visible' : 'hidden' }),
    });
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
                title={performer.fullName}
              />
            </div>
          )}

          <div className={styles.info}>
            <Form
              validationErrors={validationErrors}
              validationWarnings={validationWarnings}
            >
              <FormGroup>
                <FormLabel>{translate('Visible')}</FormLabel>
                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="visible"
                  helpText={translate('VisiblePerformerHelpText')}
                  helpTextWarning={
                    visible
                      ? undefined
                      : translate('HiddenPerformerHelpTextWarning')
                  }
                  {...settings.visible}
                  onChange={handleInputChange}
                />
              </FormGroup>

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

              {isMovieMonitorSupported ? (
                <FormGroup>
                  <FormLabel>{translate('MonitoredMovie')}</FormLabel>
                  <FormInputGroup
                    type={inputTypes.CHECK}
                    name="moviesMonitored"
                    helpText={translate('MonitoredPerformerMovieHelpText')}
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
                  helpText={translate('MonitorAfterPerformerHelpText')}
                  {...settings.afterDate}
                  onChange={handleInputChange}
                />
              </FormGroup>

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
