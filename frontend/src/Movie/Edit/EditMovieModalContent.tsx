import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckInputProps } from 'Components/Form/CheckInput';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputButton from 'Components/Form/FormInputButton';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { QualityProfileSelectInputProps } from 'Components/Form/Select/QualityProfileSelectInput';
import { MovieTagInputProps } from 'Components/Form/Tag/MovieTagInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { icons, inputTypes, kinds, sizes } from 'Helpers/Props';
import MoveMovieModal from 'Movie/MoveMovie/MoveMovieModal';
import Movie from 'Movie/Movie';
import { useSaveMovie } from 'Movie/useMovie';
import selectSettings from 'Store/Selectors/selectSettings';
import { InputChanged } from 'typings/inputs';
import { ValidationError, ValidationWarning } from 'typings/pending';
import translate from 'Utilities/String/translate';
import RootFolderModal from './RootFolder/RootFolderModal';
import { RootFolderUpdated } from './RootFolder/RootFolderModalContent';
import styles from './EditMovieModalContent.css';

export interface EditMovieModalContentProps {
  movie: Movie;
  onModalClose: () => void;
  onDeleteMoviePress: () => void;
}

function EditMovieModalContent({
  movie,
  onModalClose,
  onDeleteMoviePress,
}: Readonly<EditMovieModalContentProps>) {
  const { title, path: originalPath } = movie;

  const [monitored, setMonitored] = useState(movie.monitored);
  const [qualityProfileId, setQualityProfileId] = useState(
    movie.qualityProfileId
  );
  const [path, setPath] = useState(movie.path);
  const [tags, setTags] = useState(movie.tags ?? []);
  const [rootFolderPath, setRootFolderPath] = useState(movie.rootFolderPath);

  const [isRootFolderModalOpen, setIsRootFolderModalOpen] = useState(false);
  const [isConfirmMoveModalOpen, setIsConfirmMoveModalOpen] = useState(false);

  // moveFiles is a query param, so it is fixed per mutation instance rather
  // than passed at mutate() time. The component has exactly two save paths.
  const saveMovie = useSaveMovie(false);
  const saveMovieAndMoveFiles = useSaveMovie(true);

  const isSaving = saveMovie.isPending || saveMovieAndMoveFiles.isPending;
  // Map ApiError to the { status, responseJSON } shape expected by
  // selectSettings and SpinnerErrorButton.
  const saveError = useMemo(() => {
    const err = saveMovie.error ?? saveMovieAndMoveFiles.error;
    if (!err) return undefined;
    return { status: err.statusCode, responseJSON: err.statusBody };
  }, [saveMovie.error, saveMovieAndMoveFiles.error]);

  // Compute which fields have pending (unsaved) changes so selectSettings
  // can mark them accordingly.
  const pendingChanges = useMemo(() => {
    const changes: Partial<Movie> = {};
    if (monitored !== movie.monitored) changes.monitored = monitored;
    if (qualityProfileId !== movie.qualityProfileId)
      changes.qualityProfileId = qualityProfileId;
    if (path !== movie.path) changes.path = path;
    if (JSON.stringify(tags) !== JSON.stringify(movie.tags ?? []))
      changes.tags = tags;
    return changes;
  }, [monitored, qualityProfileId, path, tags, movie]);

  const isPathChanging = path !== originalPath;

  // TODO: move to a .ts or reuse an existing one.
  interface Setting {
    value?:
      string | boolean | number | Array<string | number> | null | undefined;
    errors: Array<{
      message: string;
      link?: string;
      detailedMessage?: string;
    }>;
    warnings: Array<{
      message: string;
      link?: string;
      detailedMessage?: string;
    }>;
    previousValue?:
      string | boolean | number | Array<string | number> | null | undefined;
    pending?: boolean;
  }

  type PathSetting = Setting & { value: string };

  interface SelectSettingsResult {
    settings: Record<string, Setting>;
    validationErrors: ValidationError[];
    validationWarnings: ValidationWarning[];
    hasPendingChanges: boolean;
    hasSettings: boolean;
    pendingChanges: unknown;
  }

  // TODO: Move to a hook
  const memoResult = useMemo(() => {
    return selectSettings(
      { monitored, qualityProfileId, path, tags },
      pendingChanges,
      saveError
    );
  }, [
    monitored,
    qualityProfileId,
    path,
    tags,
    pendingChanges,
    saveError,
  ]) as unknown as SelectSettingsResult;

  const { settings, ...otherSettings } = memoResult;

  const rawPathSetting = settings.path;

  const pathSetting = useMemo<PathSetting>(() => {
    if (!rawPathSetting) {
      return { value: '', errors: [], warnings: [] };
    }
    return {
      ...rawPathSetting,
      value:
        typeof rawPathSetting.value === 'string' ? rawPathSetting.value : '',
    };
  }, [rawPathSetting]);

  const handleInputChange = useCallback(({ name, value }: InputChanged) => {
    switch (name) {
      case 'monitored':
        setMonitored(value as boolean);
        break;
      case 'qualityProfileId':
        setQualityProfileId(value as number);
        break;
      case 'path':
        setPath(value as string);
        break;
      case 'tags':
        setTags(value as number[]);
        break;
      default:
        break;
    }
  }, []);

  const handleRootFolderPress = useCallback(() => {
    setIsRootFolderModalOpen(true);
  }, []);

  const handleRootFolderModalClose = useCallback(() => {
    setIsRootFolderModalOpen(false);
  }, []);

  const handleRootFolderChange = useCallback(
    ({
      path: newPath,
      rootFolderPath: newRootFolderPath,
    }: RootFolderUpdated) => {
      setIsRootFolderModalOpen(false);
      setRootFolderPath(newRootFolderPath);
      setPath(newPath);
    },
    []
  );

  const handleCancelPress = useCallback(() => {
    setIsConfirmMoveModalOpen(false);
  }, []);

  const doSave = useCallback(
    (moveFiles: boolean) => {
      const mutation = moveFiles ? saveMovieAndMoveFiles : saveMovie;

      mutation.mutate({ ...movie, monitored, qualityProfileId, path, tags });
    },
    [
      saveMovie,
      saveMovieAndMoveFiles,
      movie,
      monitored,
      qualityProfileId,
      path,
      tags,
    ]
  );

  const handleSavePress = useCallback(() => {
    if (isPathChanging && !isConfirmMoveModalOpen) {
      setIsConfirmMoveModalOpen(true);
    } else {
      setIsConfirmMoveModalOpen(false);
      doSave(false);
    }
  }, [isPathChanging, isConfirmMoveModalOpen, doSave]);

  const handleMoveMoviePress = useCallback(() => {
    setIsConfirmMoveModalOpen(false);
    doSave(true);
  }, [doSave]);

  useEffect(() => {
    if (saveMovie.isSuccess || saveMovieAndMoveFiles.isSuccess) {
      onModalClose();
    }
  }, [saveMovie.isSuccess, saveMovieAndMoveFiles.isSuccess, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('EditMovieModalHeader', { title })}</ModalHeader>

      <ModalBody>
        <Form {...otherSettings}>
          <FormGroup size={sizes.MEDIUM}>
            <FormLabel>{translate('Monitored')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="monitored"
              helpText={translate('MonitoredMovieHelpText')}
              {...(settings.monitored as unknown as Omit<
                CheckInputProps,
                'className' | 'name'
              >)}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup size={sizes.MEDIUM}>
            <FormLabel>{translate('QualityProfile')}</FormLabel>

            <FormInputGroup
              type={inputTypes.QUALITY_PROFILE_SELECT}
              name="qualityProfileId"
              {...(settings.qualityProfileId as unknown as Omit<
                QualityProfileSelectInputProps,
                'className' | 'name'
              >)}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup size={sizes.MEDIUM}>
            <FormLabel>{translate('Path')}</FormLabel>

            <FormInputGroup
              type={inputTypes.PATH}
              name="path"
              {...pathSetting}
              buttons={[
                <FormInputButton
                  key="fileBrowser"
                  kind={kinds.DEFAULT}
                  title={translate('RootFolder')}
                  onPress={handleRootFolderPress}
                >
                  <Icon name={icons.ROOT_FOLDER} />
                </FormInputButton>,
              ]}
              includeFiles={false}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup size={sizes.MEDIUM}>
            <FormLabel>{translate('Tags')}</FormLabel>

            <FormInputGroup
              type={inputTypes.TAG}
              name="tags"
              {...(settings.tags as unknown as Omit<
                MovieTagInputProps<string | number>,
                'className' | 'name'
              >)}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button
          className={styles.deleteButton}
          kind={kinds.DANGER}
          onPress={onDeleteMoviePress}
        >
          {translate('Delete')}
        </Button>

        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <SpinnerErrorButton
          error={saveError}
          isSpinning={isSaving}
          onPress={handleSavePress}
        >
          {translate('Save')}
        </SpinnerErrorButton>
      </ModalFooter>

      <RootFolderModal
        isOpen={isRootFolderModalOpen}
        movieId={movie.id}
        rootFolderPath={rootFolderPath}
        onSavePress={handleRootFolderChange}
        onModalClose={handleRootFolderModalClose}
      />

      <MoveMovieModal
        originalPath={originalPath}
        destinationPath={path === originalPath ? undefined : path}
        isOpen={isConfirmMoveModalOpen}
        onModalClose={handleCancelPress}
        onSavePress={handleSavePress}
        onMoveMoviePress={handleMoveMoviePress}
      />
    </ModalContent>
  );
}

export default EditMovieModalContent;
