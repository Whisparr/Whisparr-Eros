import React, { useCallback, useMemo } from 'react';
import { DELETE_MOVIE_FILES } from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import sortByProp from 'Utilities/Array/sortByProp';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './DeleteMovieFilesModalContent.module.css';

export type DeleteMovieFilesItemType = 'movie' | 'scene';

const TRANSLATION_KEYS = {
  movie: {
    title: 'DeleteSelectedMovieFiles',
    confirmation: 'DeleteFilesOfSelectedMoviesConfirmation',
    fileCount: 'DeleteMovieFolderMovieCount',
  },
  scene: {
    title: 'DeleteSelectedSceneFiles',
    confirmation: 'DeleteFilesOfSelectedScenesConfirmation',
    fileCount: 'DeleteSceneFolderSceneCount',
  },
};

export interface DeleteMovieFilesModalContentProps {
  itemType: DeleteMovieFilesItemType;
  movieIds: number[];
  items: Movie[];
  onModalClose: () => void;
}

function DeleteMovieFilesModalContent({
  itemType,
  movieIds,
  items,
  onModalClose,
}: Readonly<DeleteMovieFilesModalContentProps>) {
  const executeCommand = useExecuteCommand();
  const keys = TRANSLATION_KEYS[itemType];

  const movies = useMemo(() => {
    const selected = new Set(movieIds);

    return items
      .filter((movie) => selected.has(movie.id))
      .sort(sortByProp<Movie, 'sortTitle'>('sortTitle'));
  }, [items, movieIds]);

  const { totalFileCount, totalSizeOnDisk } = useMemo(() => {
    return movies.reduce(
      (acc, { statistics }) => {
        acc.totalFileCount += statistics?.movieFileCount ?? 0;
        acc.totalSizeOnDisk += statistics?.sizeOnDisk ?? 0;

        return acc;
      },
      { totalFileCount: 0, totalSizeOnDisk: 0 }
    );
  }, [movies]);

  const handleDeleteConfirmed = useCallback(() => {
    executeCommand({
      name: DELETE_MOVIE_FILES,
      movieIds,
    });

    onModalClose();
  }, [movieIds, executeCommand, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate(keys.title)}</ModalHeader>

      <ModalBody>
        <div className={styles.message}>
          {translate(keys.confirmation, { count: movies.length })}
        </div>

        <ul>
          {movies.map(({ id, title, path, statistics }) => {
            const movieFileCount = statistics?.movieFileCount ?? 0;

            return (
              <li key={id}>
                <span>{title}</span>

                <span className={styles.pathContainer}>
                  -<span className={styles.path}>{path}</span>
                </span>

                {movieFileCount ? (
                  <span className={styles.statistics}>
                    (
                    {translate(keys.fileCount, {
                      movieFileCount,
                      size: formatBytes(statistics?.sizeOnDisk ?? 0),
                    })}
                    )
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>

        {totalFileCount ? (
          <div className={styles.deleteFilesMessage}>
            {translate(keys.fileCount, {
              movieFileCount: totalFileCount,
              size: formatBytes(totalSizeOnDisk),
            })}
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <Button kind={kinds.DANGER} onPress={handleDeleteConfirmed}>
          {translate('Delete')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default DeleteMovieFilesModalContent;
