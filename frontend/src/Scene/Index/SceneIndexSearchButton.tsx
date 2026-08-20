import React, { useCallback, useMemo, useState } from 'react';
import { useSelect } from 'App/SelectContext';
import { MOVIE_SEARCH } from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import { icons, kinds } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';

interface SceneIndexSearchButtonProps {
  isSelectMode: boolean;
  selectedFilterKey: string;
  items: Movie[];
}

function SceneIndexSearchButton(props: SceneIndexSearchButtonProps) {
  const { items } = props;
  const isSearching = useCommandExecuting(MOVIE_SEARCH);

  const executeCommand = useExecuteCommand();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { isSelectMode, selectedFilterKey } = props;
  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const selectedSceneIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const scenesToSearch =
    isSelectMode && selectedSceneIds.length > 0
      ? selectedSceneIds
      : items.map((m) => m.id);

  const searchIndexLabel =
    selectedFilterKey === 'all'
      ? translate('SearchAll')
      : translate('SearchFiltered');

  const searchSelectLabel =
    selectedSceneIds.length > 0
      ? translate('SearchSelected')
      : translate('SearchAll');

  const onPress = useCallback(() => {
    setIsConfirmModalOpen(false);

    executeCommand({
      name: MOVIE_SEARCH,
      movieIds: scenesToSearch,
    });
  }, [scenesToSearch, executeCommand]);

  const onConfirmPress = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, [setIsConfirmModalOpen]);

  const onConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
  }, [setIsConfirmModalOpen]);

  return (
    <>
      <PageToolbarButton
        label={isSelectMode ? searchSelectLabel : searchIndexLabel}
        isSpinning={isSearching}
        isDisabled={!items.length}
        iconName={icons.SEARCH}
        onPress={scenesToSearch.length > 5 ? onConfirmPress : onPress}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        kind={kinds.DANGER}
        title={isSelectMode ? searchSelectLabel : searchIndexLabel}
        message={translate('SearchMoviesConfirmationMessageText', {
          count: scenesToSearch.length,
        })}
        confirmLabel={isSelectMode ? searchSelectLabel : searchIndexLabel}
        onConfirm={onPress}
        onCancel={onConfirmModalClose}
      />
    </>
  );
}

export default SceneIndexSearchButton;
