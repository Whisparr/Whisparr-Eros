import React from 'react';
import Alert from 'Components/Alert';
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
import MoviePoster from 'Movie/MoviePoster';
import ScenePoster from 'Scene/ScenePoster';
import translate from 'Utilities/String/translate';
import { MovieLookupResult, useAddMovieMutation } from '../useAddNewMovie';
import styles from './AddNewMovieModalContent.css';

interface AddNewMovieModalContentProps {
  item: MovieLookupResult;
  onModalClose: () => void;
}

function AddNewMovieModalContent({
  item,
  onModalClose,
}: AddNewMovieModalContentProps) {
  const { title, year, overview, images } = item;

  const {
    settings,
    validationErrors,
    validationWarnings,
    isAdding,
    addError,
    isSmallScreen,
    safeForWorkMode,
    isWindows,
    onInputChange,
    onAddMoviePress,
  } = useAddMovieMutation(item, onModalClose);

  const { rootFolderPath, monitored, qualityProfileId, searchForMovie, tags } =
    settings;

  const imageStyle =
    images?.length && images[0]?.coverType === 'screenshot'
      ? styles.screenShot
      : styles.poster;
  const ImageComponent = (
    imageStyle === styles.screenShot ? ScenePoster : MoviePoster
  ) as React.ComponentType<{
    blur?: boolean;
    className?: string;
    images: typeof images;
    size?: number;
    lazy?: boolean;
  }>;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {title}

        {!title.includes(String(year)) && !!year && (
          <span className={styles.year}>({year})</span>
        )}
      </ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          {!isSmallScreen && (
            <ImageComponent
              blur={safeForWorkMode}
              className={imageStyle}
              images={images}
              size={250}
              lazy={false}
            />
          )}

          <div className={styles.info}>
            <div className={styles.overview}>{overview}</div>

            {addError && (
              <Alert kind={kinds.DANGER}>
                {addError.statusBody?.message ?? addError.message}
              </Alert>
            )}

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
                    movieFolder: item.folder,
                    isWindows,
                  }}
                  selectedValueOptions={{
                    movieFolder: item.folder,
                    isWindows,
                  }}
                  helpText={translate(
                    'SubfolderWillBeCreatedAutomaticallyInterp',
                    { 0: item.folder }
                  )}
                  onChange={onInputChange}
                  {...rootFolderPath}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Monitor')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.CHECK}
                  name="monitored"
                  helpText={translate('MonitoredMovieHelpText')}
                  {...monitored}
                  onChange={onInputChange}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('QualityProfile')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.QUALITY_PROFILE_SELECT}
                  name="qualityProfileId"
                  onChange={onInputChange}
                  {...qualityProfileId}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>{translate('Tags')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.TAG}
                  name="tags"
                  onChange={onInputChange}
                  {...tags}
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
            onChange={onInputChange}
            {...searchForMovie}
          />
        </label>

        <SpinnerButton
          className={styles.addButton}
          kind={kinds.SUCCESS}
          isSpinning={isAdding}
          onPress={onAddMoviePress}
        >
          {translate('AddMovie')}
        </SpinnerButton>
      </ModalFooter>
    </ModalContent>
  );
}

export default AddNewMovieModalContent;
