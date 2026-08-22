import React, { useCallback, useMemo } from 'react';
import ModelBase from 'App/ModelBase';
import { useSelect } from 'App/SelectContext';
import { REFRESH_PERFORMER } from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';

interface PerformerIndexRefreshPerformerButtonProps {
  isSelectMode: boolean;
  selectedFilterKey: string | number;
  items: ModelBase[];
  totalItems: number;
}

function PerformerIndexRefreshPerformerButton(
  props: PerformerIndexRefreshPerformerButtonProps
) {
  const isRefreshing = useCommandExecuting(REFRESH_PERFORMER);

  const executeCommand = useExecuteCommand();
  const { isSelectMode, selectedFilterKey, items, totalItems } = props;
  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const selectedPerformerIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const performersToRefresh =
    isSelectMode && selectedPerformerIds.length > 0
      ? selectedPerformerIds
      : items.map((m) => m.id);

  const refreshIndexLabel =
    selectedFilterKey === 'all'
      ? translate('UpdateAll')
      : translate('UpdateFiltered');

  const refreshSelectLabel =
    selectedPerformerIds.length > 0
      ? translate('UpdateSelected')
      : translate('UpdateAll');

  const onPress = useCallback(() => {
    executeCommand({
      name: REFRESH_PERFORMER,
      performerIds: performersToRefresh,
    });
  }, [performersToRefresh, executeCommand]);

  return (
    <PageToolbarButton
      label={isSelectMode ? refreshSelectLabel : refreshIndexLabel}
      isSpinning={isRefreshing}
      isDisabled={!totalItems}
      iconName={icons.REFRESH}
      onPress={onPress}
    />
  );
}

export default PerformerIndexRefreshPerformerButton;
