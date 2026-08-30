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
import styles from './OrganizeScenesModalContent.css';

interface OrganizeScenesModalContentProps {
  sceneIds: number[];
  items: Movie[];
  onModalClose: () => void;
}

function OrganizeScenesModalContent(
  props: Readonly<OrganizeScenesModalContentProps>
) {
  const { sceneIds, items, onModalClose } = props;

  const executeCommand = useExecuteCommand();

  const sceneTitles = useMemo(() => {
    const scene = sceneIds.reduce((acc: Movie[], id) => {
      const s = items.find((s) => s.id === id);

      if (s) {
        acc.push(s);
      }

      return acc;
    }, []);

    const sorted = orderBy(scene, ['sortTitle']);

    return sorted.map((s) => s.title);
  }, [sceneIds, items]);

  const onOrganizePress = useCallback(() => {
    executeCommand({
      name: RENAME_MOVIE,
      movieIds: sceneIds,
    });

    onModalClose();
  }, [sceneIds, onModalClose, executeCommand]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('OrganizeSelectedScenes')}</ModalHeader>

      <ModalBody>
        <Alert>
          {translate('PreviewRenameHelpText')}
          <Icon className={styles.renameIcon} name={icons.ORGANIZE} />
        </Alert>

        <div className={styles.message}>
          {translate('OrganizeConfirm', { count: sceneIds.length })}
        </div>

        <ul>
          {sceneTitles.map((title) => {
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

export default OrganizeScenesModalContent;
