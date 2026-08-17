import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import useMovieCollection from 'Collection/useMovieCollection';
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
import usePrevious from 'Helpers/Hooks/usePrevious';
import { inputTypes, kinds } from 'Helpers/Props';
import { Image } from 'Movie/Movie';
import MoviePoster from 'Movie/MoviePoster';
import {
  addMovie,
  setMovieCollectionValue,
} from 'Store/Actions/movieCollectionActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import { useIsWindows } from 'System/Status/useSystemStatus';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './AddNewMovieCollectionMovieModalContent.css';

export interface AddNewMovieCollectionMovieModalContentProps {
  foreignId: number;
  title: string;
  year: number;
  overview?: string;
  images: Image[];
  collectionId: number;
  folder: string;
  onModalClose: () => void;
}

function AddNewMovieCollectionMovieModalContent({
  foreignId,
  title,
  year,
  overview,
  images,
  collectionId,
  folder,
  onModalClose,
}: AddNewMovieCollectionMovieModalContentProps) {
  const dispatch = useDispatch();

  const collection = useMovieCollection(collectionId)!;

  const { isSmallScreen } = useSelector(createDimensionsSelector());
  const isWindows = useIsWindows();

  const { isAdding, addError, pendingChanges } = useSelector(
    (state: AppState) => state.movieCollections
  );

  const wasAdding = usePrevious(isAdding);

  const { settings, validationErrors, validationWarnings } = useMemo(() => {
    const options = {
      rootFolderPath: collection.rootFolderPath,
      monitored: collection.monitored,
      qualityProfileId: collection.qualityProfileId,
      searchForMovie: collection.searchOnAdd,
      tags: collection.tags || [],
    };

    return selectSettings(options, pendingChanges, addError);
  }, [collection, pendingChanges, addError]);

  const { monitored, qualityProfileId, rootFolderPath, searchForMovie, tags } =
    settings;

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      // @ts-expect-error actions aren't typed
      dispatch(setMovieCollectionValue({ name, value }));
    },
    [dispatch]
  );

  const handleAddMoviePress = useCallback(() => {
    dispatch(
      addMovie({
        foreignId,
        title,
        rootFolderPath: rootFolderPath.value,
        monitored: monitored.value,
        qualityProfileId: qualityProfileId.value,
        searchForMovie: searchForMovie.value,
        tags: tags.value,
      })
    );
  }, [
    foreignId,
    title,
    rootFolderPath,
    monitored,
    qualityProfileId,
    searchForMovie,
    tags,
    dispatch,
  ]);

  useEffect(() => {
    if (!isAdding && wasAdding && !addError) {
      onModalClose();
    }
  }, [isAdding, wasAdding, addError, onModalClose]);

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
                  {...rootFolderPath}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Monitor')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitored"
                  helpText={translate('MonitoredMovieHelpText')}
                  {...monitored}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('QualityProfile')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.QUALITY_PROFILE_SELECT}
                  name="qualityProfileId"
                  {...qualityProfileId}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Tags')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.TAG}
                  name="tags"
                  {...tags}
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
            {...searchForMovie}
            onChange={handleInputChange}
          />
        </label>

        <SpinnerButton
          className={styles.addButton}
          kind={kinds.SUCCESS}
          isSpinning={isAdding}
          onPress={handleAddMoviePress}
        >
          {translate('AddMovie')}
        </SpinnerButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default AddNewMovieCollectionMovieModalContent;
