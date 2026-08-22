import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Movie from 'Movie/Movie';
import {
  setMovieDeleteOption,
  useMovieDeleteOptions,
} from 'Movie/movieDeleteOptionsStore';
import { CheckInputChanged } from 'typings/inputs';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import { useDeleteMovieMutation } from './useDeleteMovieMutation';
import styles from './DeleteMovieModalContent.css';

export interface DeleteMovieModalContentProps {
  movie: Movie;
  onModalClose: () => void;
}

function DeleteMovieModalContent({
  movie,
  onModalClose,
}: Readonly<DeleteMovieModalContentProps>) {
  const navigate = useNavigate();
  const { addImportExclusion } = useMovieDeleteOptions();
  const { mutate: deleteMovie } = useDeleteMovieMutation();

  const { movieFileCount = 0, sizeOnDisk = 0 } = movie.statistics || {};

  const [deleteFiles, setDeleteFiles] = useState(false);

  const handleDeleteFilesChange = useCallback(
    ({ value }: CheckInputChanged) => {
      setDeleteFiles(value);
    },
    []
  );

  const handleDeleteMovieConfirmed = useCallback(() => {
    deleteMovie({
      id: movie.id,
      deleteFiles,
      addImportExclusion,
    });

    navigate(movie.itemType === 'movie' ? '/movies' : '/scenes');
  }, [movie, addImportExclusion, deleteFiles, navigate, deleteMovie]);

  const handleDeleteOptionChange = useCallback(
    ({ name, value }: CheckInputChanged) => {
      setMovieDeleteOption(name as 'addImportExclusion', value);
    },
    []
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('DeleteHeader', { movie: movie.title })}
      </ModalHeader>

      <ModalBody>
        <div className={styles.pathContainer}>
          <Icon className={styles.pathIcon} name={icons.FOLDER} />

          {movie.path}
        </div>

        <FormGroup>
          <FormLabel>{translate('AddListExclusion')}</FormLabel>

          <FormInputGroup
            type={inputTypes.CHECK}
            name="addImportExclusion"
            value={addImportExclusion}
            helpText={translate('AddListExclusionMovieHelpText')}
            kind={kinds.DANGER}
            onChange={handleDeleteOptionChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>
            {movieFileCount === 0
              ? translate('DeleteMovieFolder')
              : translate('DeleteMovieFiles', { movieFileCount })}
          </FormLabel>

          <FormInputGroup
            type={inputTypes.CHECK}
            name="deleteFiles"
            value={deleteFiles}
            helpText={
              movieFileCount === 0
                ? translate('DeleteMovieFolderHelpText')
                : translate('DeleteMovieFilesHelpText')
            }
            kind={kinds.DANGER}
            onChange={handleDeleteFilesChange}
          />
        </FormGroup>

        {deleteFiles ? (
          <div className={styles.deleteFilesMessage}>
            <div>
              <InlineMarkdown
                data={translate('DeleteMovieFolderConfirmation', {
                  path: movie.path,
                })}
                blockClassName={styles.folderPath}
              />
            </div>

            {movieFileCount ? (
              <div className={styles.deleteCount}>
                {translate('DeleteMovieFolderMovieCount', {
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

        <Button kind={kinds.DANGER} onPress={handleDeleteMovieConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteMovieModalContent;
