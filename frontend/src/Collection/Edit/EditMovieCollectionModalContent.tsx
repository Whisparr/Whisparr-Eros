import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDimension } from 'App/appStore';
import MovieCollection from 'Collection/MovieCollection';
import {
  useMovieCollection,
  useSaveMovieCollection,
} from 'Collection/useMovieCollections';
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
import selectSettings from 'Helpers/selectSettings';
import MoviePoster from 'Movie/MoviePoster';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './EditMovieCollectionModalContent.css';

export interface EditMovieCollectionModalContentProps {
  collectionId: number;
  onModalClose: () => void;
}

function EditMovieCollectionModalContent({
  collectionId,
  onModalClose,
}: EditMovieCollectionModalContentProps) {
  const collection = useMovieCollection(collectionId)!;
  const isSmallScreen = useAppDimension('isSmallScreen');

  const [monitored, setMonitored] = useState(collection.monitored);
  const [monitorNewItems, setMonitorNewItems] = useState(
    collection.monitorNewItems
  );
  const [qualityProfileId, setQualityProfileId] = useState(
    collection.qualityProfileId
  );
  const [rootFolderPath, setRootFolderPath] = useState(
    collection.rootFolderPath
  );
  const [searchOnAdd, setSearchOnAdd] = useState(collection.searchOnAdd);
  const [tags, setTags] = useState(collection.tags ?? []);

  const saveCollection = useSaveMovieCollection();

  // The fields the user has actually touched. Sent as a patch over the
  // collection on save, and handed to selectSettings so it can mark them
  // pending -- which is what `movieCollections.pendingChanges` did.
  const pendingChanges = useMemo(() => {
    const changes: Partial<MovieCollection> = {};

    if (monitored !== collection.monitored) {
      changes.monitored = monitored;
    }

    if (monitorNewItems !== collection.monitorNewItems) {
      changes.monitorNewItems = monitorNewItems;
    }

    if (qualityProfileId !== collection.qualityProfileId) {
      changes.qualityProfileId = qualityProfileId;
    }

    if (rootFolderPath !== collection.rootFolderPath) {
      changes.rootFolderPath = rootFolderPath;
    }

    if (searchOnAdd !== collection.searchOnAdd) {
      changes.searchOnAdd = searchOnAdd;
    }

    if (JSON.stringify(tags) !== JSON.stringify(collection.tags ?? [])) {
      changes.tags = tags;
    }

    return changes;
  }, [
    monitored,
    monitorNewItems,
    qualityProfileId,
    rootFolderPath,
    searchOnAdd,
    tags,
    collection,
  ]);

  const { settings, validationErrors, validationWarnings } = useMemo(() => {
    return selectSettings(
      {
        monitored: collection.monitored,
        monitorNewItems: collection.monitorNewItems,
        qualityProfileId: collection.qualityProfileId,
        rootFolderPath: collection.rootFolderPath,
        searchOnAdd: collection.searchOnAdd,
        tags: collection.tags ?? [],
      },
      pendingChanges,
      saveCollection.error
    );
  }, [collection, pendingChanges, saveCollection.error]);

  const handleInputChange = useCallback(({ name, value }: InputChanged) => {
    switch (name) {
      case 'monitored':
        setMonitored(value as boolean);
        break;
      case 'monitorNewItems':
        setMonitorNewItems(value as boolean);
        break;
      case 'qualityProfileId':
        setQualityProfileId(value as number);
        break;
      case 'rootFolderPath':
        setRootFolderPath(value as string);
        break;
      case 'searchOnAdd':
        setSearchOnAdd(value as boolean);
        break;
      case 'tags':
        setTags(value as number[]);
        break;
      default:
        break;
    }
  }, []);

  const handleSavePress = useCallback(() => {
    saveCollection.mutate({ ...collection, ...pendingChanges });
  }, [saveCollection, collection, pendingChanges]);

  useEffect(() => {
    if (saveCollection.isSuccess) {
      onModalClose();
    }
  }, [saveCollection.isSuccess, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('EditMovieCollectionModalHeader', {
          title: collection.title,
        })}
      </ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          {isSmallScreen ? null : (
            <div className={styles.poster}>
              <MoviePoster
                className={styles.poster}
                images={collection.images}
                size={250}
              />
            </div>
          )}

          <div className={styles.info}>
            <div className={styles.overview}>{collection.overview}</div>

            <Form
              validationErrors={validationErrors}
              validationWarnings={validationWarnings}
            >
              <FormGroup>
                <FormLabel>{translate('Monitored')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitored"
                  helpText={translate('MonitoredCollectionHelpText')}
                  {...settings.monitored}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('MonitorNewItems')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitorNewItems"
                  {...settings.monitorNewItems}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('QualityProfile')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.QUALITY_PROFILE_SELECT}
                  name="qualityProfileId"
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
                  includeMissingValue={true}
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
                  helpText={translate('SearchOnAddCollectionHelpText')}
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
          error={saveCollection.error}
          isSpinning={saveCollection.isPending}
          onPress={handleSavePress}
        >
          {translate('Save')}
        </SpinnerErrorButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default EditMovieCollectionModalContent;
