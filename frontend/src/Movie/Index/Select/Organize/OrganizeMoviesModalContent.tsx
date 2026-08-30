import { orderBy } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { RENAME_MOVIE } from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { icons, kinds } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import translate from 'Utilities/String/translate';
import styles from './OrganizeMoviesModalContent.css';

interface OrganizeMoviesModalContentProps {
  movieIds: number[];
  items: Movie[];
  onModalClose: () => void;
}

function OrganizeMoviesModalContent(
  props: Readonly<OrganizeMoviesModalContentProps>
) {
  const { movieIds, items, onModalClose } = props;

  const executeCommand = useExecuteCommand();

  const movieTitles = useMemo(() => {
    const movie = movieIds.reduce((acc: Movie[], id) => {
      const s = items.find((s) => s.id === id);

      if (s) {
        acc.push(s);
      }

      return acc;
    }, []);

    const sorted = orderBy(movie, ['sortTitle']);

    return sorted.map((s) => s.title);
  }, [movieIds, items]);

  const onOrganizePress = useCallback(() => {
    executeCommand({
      name: RENAME_MOVIE,
      movieIds,
    });

    onModalClose();
  }, [movieIds, onModalClose, executeCommand]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('OrganizeSelectedMovies')}</ModalHeader>

      <ModalBody>
        <Alert>
          {translate('PreviewRenameHelpText')}
          <Icon className={styles.renameIcon} name={icons.ORGANIZE} />
        </Alert>

        <div className={styles.message}>
          {translate('OrganizeConfirm', { count: movieIds.length })}
        </div>

        <ul>
          {movieTitles.map((title) => {
            return <li key={title}>{title}</li>;
          })}
        </ul>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <Button kind={kinds.DANGER} onPress={onOrganizePress}>
          {translate('Organize')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default OrganizeMoviesModalContent;
