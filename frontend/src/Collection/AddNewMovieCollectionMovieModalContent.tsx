import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDimension } from 'App/appStore';
import MovieCollection, {
  MovieCollectionMovie,
} from 'Collection/MovieCollection';
import { useAddCollectionMovie } from 'Collection/useMovieCollections';
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
import selectSettings from 'Helpers/selectSettings';
import MoviePoster from 'Movie/MoviePoster';
import { useIsWindows } from 'System/Status/useSystemStatus';
import { InputChanged } from 'typings/inputs';
import getNewMovie from 'Utilities/Movie/getNewMovie';
import translate from 'Utilities/String/translate';
import styles from './AddNewMovieCollectionMovieModalContent.css';

export interface AddNewMovieCollectionMovieModalContentProps {
  movie: MovieCollectionMovie;
  collection: MovieCollection;
  onModalClose: () => void;
}

function AddNewMovieCollectionMovieModalContent({
  movie,
  collection,
  onModalClose,
}: AddNewMovieCollectionMovieModalContentProps) {
  const { foreignId, title, year, overview, images, folder } = movie;

  const isSmallScreen = useAppDimension('isSmallScreen');
  const isWindows = useIsWindows();

  const [rootFolderPath, setRootFolderPath] = useState(
    collection.rootFolderPath
  );
  const [monitored, setMonitored] = useState(collection.monitored);
  const [qualityProfileId, setQualityProfileId] = useState(
    collection.qualityProfileId
  );
  const [searchForMovie, setSearchForMovie] = useState(collection.searchOnAdd);
  const [tags, setTags] = useState(collection.tags ?? []);

  const addMovie = useAddCollectionMovie();

  // Only the fields the user has actually touched, so `selectSettings` marks
  // exactly those pending -- `movieCollections.pendingChanges` held the same.
  const pendingChanges = useMemo(() => {
    const changes: Record<string, unknown> = {};

    if (rootFolderPath !== collection.rootFolderPath) {
      changes.rootFolderPath = rootFolderPath;
    }

    if (monitored !== collection.monitored) {
      changes.monitored = monitored;
    }

    if (qualityProfileId !== collection.qualityProfileId) {
      changes.qualityProfileId = qualityProfileId;
    }

    if (searchForMovie !== collection.searchOnAdd) {
      changes.searchForMovie = searchForMovie;
    }

    if (JSON.stringify(tags) !== JSON.stringify(collection.tags ?? [])) {
      changes.tags = tags;
    }

    return changes;
  }, [
    collection,
    rootFolderPath,
    monitored,
    qualityProfileId,
    searchForMovie,
    tags,
  ]);

  const { settings, validationErrors, validationWarnings } = useMemo(() => {
    return selectSettings(
      {
        rootFolderPath: collection.rootFolderPath,
        monitored: collection.monitored,
        qualityProfileId: collection.qualityProfileId,
        searchForMovie: collection.searchOnAdd,
        tags: collection.tags ?? [],
      },
      pendingChanges,
      addMovie.error
    );
  }, [collection, pendingChanges, addMovie.error]);

  const handleInputChange = useCallback(({ name, value }: InputChanged) => {
    switch (name) {
      case 'rootFolderPath':
        setRootFolderPath(value as string);
        break;
      case 'monitored':
        setMonitored(value as boolean);
        break;
      case 'qualityProfileId':
        setQualityProfileId(value as number);
        break;
      case 'searchForMovie':
        setSearchForMovie(value as boolean);
        break;
      case 'tags':
        setTags(value as number[]);
        break;
      default:
        break;
    }
  }, []);

  const handleAddMoviePress = useCallback(() => {
    addMovie.mutate({
      ...getNewMovie(
        { foreignId, title },
        {
          rootFolderPath,
          monitored,
          qualityProfileId,
          searchForMovie,
          tags,
        }
      ),
      id: 0,
    });
  }, [
    addMovie,
    foreignId,
    title,
    rootFolderPath,
    monitored,
    qualityProfileId,
    searchForMovie,
    tags,
  ]);

  useEffect(() => {
    if (addMovie.isSuccess) {
      onModalClose();
    }
  }, [addMovie.isSuccess, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {title}

        {!title.includes(String(year)) && year ? (
          <span className={styles.year}>({year})</span>
        ) : null}
      </ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          {isSmallScreen ? null : (
            <div className={styles.poster}>
              <MoviePoster
                className={styles.poster}
                images={images}
                size={250}
              />
            </div>
          )}

          <div className={styles.info}>
            {overview ? (
              <div className={styles.overview}>{overview}</div>
            ) : null}

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
                    movieFolder: folder,
                    isWindows,
                  }}
                  selectedValueOptions={{
                    movieFolder: folder,
                    isWindows,
                  }}
                  helpText={translate('AddNewMovieRootFolderHelpText', {
                    folder,
                  })}
                  {...settings.rootFolderPath}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Monitor')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitored"
                  helpText={translate('MonitoredMovieHelpText')}
                  {...settings.monitored}
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
                <FormLabel>{translate('Tags')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.TAG}
                  name="tags"
                  {...settings.tags}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Form>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className={styles.modalFooter}>
        <label className={styles.searchForMissingMovieLabelContainer}>
          <span className={styles.searchForMissingMovieLabel}>
            {translate('StartSearchForMissingMovie')}
          </span>

          <CheckInput
            containerClassName={styles.searchForMissingMovieContainer}
            className={styles.searchForMissingMovieInput}
            name="searchForMovie"
            {...settings.searchForMovie}
            onChange={handleInputChange}
          />
        </label>

        <SpinnerButton
          className={styles.addButton}
          kind={kinds.SUCCESS}
          isSpinning={addMovie.isPending}
          onPress={handleAddMoviePress}
        >
          {translate('AddMovie')}
        </SpinnerButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default AddNewMovieCollectionMovieModalContent;
