import React, { useCallback, useState } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { icons, inputTypes, kinds } from 'Helpers/Props';
import { useDeleteMovieMutation } from 'Movie/Delete/useDeleteMovieMutation';
import Movie from 'Movie/Movie';
import {
  setMovieDeleteOption,
  useMovieDeleteOptions,
} from 'Movie/movieDeleteOptionsStore';
import { CheckInputChanged } from 'typings/inputs';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './DeleteSceneModalContent.css';

export interface DeleteSceneModalContentProps {
  scene: Movie;
  onModalClose: () => void;
}

function DeleteSceneModalContent({
  scene,
  onModalClose,
}: Readonly<DeleteSceneModalContentProps>) {
  // The exclusion preference is deliberately the same store the movie modal
  // uses -- it was one `movies.deleteOptions` blob before either converted.
  const { addImportExclusion } = useMovieDeleteOptions();

  // Scenes never belong to a collection, so there is no collection count for
  // the mutation to nudge.
  const { mutate: deleteScene } = useDeleteMovieMutation();

  const { movieFileCount = 0, sizeOnDisk = 0 } = scene.statistics || {};

  const [deleteFiles, setDeleteFiles] = useState(false);

  const handleDeleteFilesChange = useCallback(
    ({ value }: CheckInputChanged) => {
      setDeleteFiles(value);
    },
    []
  );

  const handleDeleteOptionChange = useCallback(
    ({ name, value }: CheckInputChanged) => {
      setMovieDeleteOption(name as 'addImportExclusion', value);
    },
    []
  );

  // Every caller is the scene index itself, so there is nowhere to navigate to
  // afterwards -- the list refreshes off the invalidated query.
  const handleDeleteSceneConfirmed = useCallback(() => {
    deleteScene({
      id: scene.id,
      deleteFiles,
      addImportExclusion,
    });

    onModalClose();
  }, [scene, addImportExclusion, deleteFiles, deleteScene, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('DeleteHeader', { movie: scene.title })}
      </ModalHeader>

      <ModalBody>
        <div className={styles.pathContainer}>
          <Icon className={styles.pathIcon} name={icons.FOLDER} />

          {scene.path}
        </div>

        <FormGroup>
          <FormLabel>{translate('AddListExclusion')}</FormLabel>

          <FormInputGroup
            type={inputTypes.CHECK}
            name="addImportExclusion"
            value={addImportExclusion}
            helpText={translate('AddListExclusionSceneHelpText')}
            kind={kinds.DANGER}
            onChange={handleDeleteOptionChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>
            {movieFileCount === 0
              ? translate('DeleteSceneFolder')
              : translate('DeleteSceneFiles', { movieFileCount })}
          </FormLabel>

          <FormInputGroup
            type={inputTypes.CHECK}
            name="deleteFiles"
            value={deleteFiles}
            helpText={
              movieFileCount === 0
                ? translate('DeleteSceneFolderHelpText')
                : translate('DeleteSceneFilesHelpText')
            }
            kind={kinds.DANGER}
            onChange={handleDeleteFilesChange}
          />
        </FormGroup>

        {deleteFiles ? (
          <div className={styles.deleteFilesMessage}>
            <div>
              <InlineMarkdown
                data={translate('DeleteSceneFolderConfirmation', {
                  path: scene.path,
                })}
                blockClassName={styles.folderPath}
              />
            </div>

            {movieFileCount ? (
              <div className={styles.deleteCount}>
                {translate('DeleteSceneFolderSceneCount', {
                  movieFileCount,
                  size: formatBytes(sizeOnDisk),
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>

        <Button kind={kinds.DANGER} onPress={handleDeleteSceneConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteSceneModalContent;
