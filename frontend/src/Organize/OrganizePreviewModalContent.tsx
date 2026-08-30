import React, { useCallback } from 'react';
import * as commandNames from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import Alert from 'Components/Alert';
import CheckInput from 'Components/Form/CheckInput';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import useSelectState from 'Helpers/Hooks/useSelectState';
import { kinds } from 'Helpers/Props';
import { useMovie } from 'Movie/useMovie';
import { useNamingSettings } from 'Settings/MediaManagement/Naming/useNamingSettings';
import { CheckInputChanged } from 'typings/inputs';
import { SelectStateInputProps } from 'typings/props';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import OrganizePreviewRow from './OrganizePreviewRow';
import useOrganizePreview from './useOrganizePreview';
import styles from './OrganizePreviewModalContent.css';

function getValue(allSelected: boolean, allUnselected: boolean) {
  if (allSelected) {
    return true;
  } else if (allUnselected) {
    return false;
  }

  return null;
}

export interface OrganizePreviewModalContentProps {
  movieId: number;
  onModalClose: () => void;
}

function OrganizePreviewModalContent({
  movieId,
  onModalClose,
}: OrganizePreviewModalContentProps) {
  const executeCommand = useExecuteCommand();
  const {
    items,
    isFetching: isPreviewFetching,
    isFetched: isPreviewFetched,
    error: previewError,
  } = useOrganizePreview(movieId);

  const {
    data: naming,
    isFetching: isNamingFetching,
    isFetched: isNamingFetched,
    error: namingError,
  } = useNamingSettings();

  const movie = useMovie(movieId).data;
  const [selectState, setSelectState] = useSelectState();

  const { allSelected, allUnselected, selectedState } = selectState;
  const isFetching = isPreviewFetching || isNamingFetching;
  const isPopulated = isPreviewFetched && isNamingFetched;
  const error = previewError || namingError;
  const { renameMovies, standardMovieFormat } = naming;

  const selectAllValue = getValue(allSelected, allUnselected);

  const handleSelectAllChange = useCallback(
    ({ value }: CheckInputChanged) => {
      setSelectState({ type: value ? 'selectAll' : 'unselectAll', items });
    },
    [items, setSelectState]
  );

  const handleSelectedChange = useCallback(
    ({ id, value, shiftKey = false }: SelectStateInputProps) => {
      setSelectState({
        type: 'toggleSelected',
        items,
        id,
        isSelected: value,
        shiftKey,
      });
    },
    [items, setSelectState]
  );

  const handleOrganizePress = useCallback(() => {
    const files = getSelectedIds(selectedState);

    executeCommand({
      name: commandNames.RENAME_FILES,
      files,
      movieId,
    });

    onModalClose();
  }, [movieId, selectedState, onModalClose, executeCommand]);

  if (!movie) {
    return null;
  }

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('OrganizeModalHeader')}</ModalHeader>

      <ModalBody>
        {isFetching ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('OrganizeLoadError')}</Alert>
        ) : null}

        {!isFetching && isPopulated && !items.length ? (
          <div>
            {renameMovies ? (
              <div>{translate('OrganizeNothingToRename')}</div>
            ) : (
              <div>{translate('OrganizeRenamingDisabled')}</div>
            )}
          </div>
        ) : null}

        {!isFetching && isPopulated && items.length ? (
          <div>
            <Alert>
              <div>
                <InlineMarkdown
                  data={translate('OrganizeRelativePaths', {
                    path: movie.path,
                  })}
                  blockClassName={styles.path}
                />
              </div>

              <div>
                <InlineMarkdown
                  data={translate('OrganizeNamingPattern', {
                    standardMovieFormat,
                  })}
                  blockClassName={styles.standardMovieFormat}
                />
              </div>
            </Alert>

            <div className={styles.previews}>
              {items.map((item) => {
                return (
                  <OrganizePreviewRow
                    key={item.movieFileId}
                    id={item.movieFileId}
                    existingPath={item.existingPath}
                    newPath={item.newPath}
                    isSelected={selectedState[item.movieFileId]}
                    onSelectedChange={handleSelectedChange}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        {isPopulated && items.length ? (
          <CheckInput
            className={styles.selectAllInput}
            containerClassName={styles.selectAllInputContainer}
            name="selectAll"
            value={selectAllValue}
            onChange={handleSelectAllChange}
          />
        ) : null}

        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <Button kind={kinds.PRIMARY} onPress={handleOrganizePress}>
          {translate('Organize')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default OrganizePreviewModalContent;
