import React, { useCallback, useMemo } from 'react';
import ModelBase from 'App/ModelBase';
import { useSelect } from 'App/SelectContext';
import { REFRESH_STUDIO } from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';

interface StudioIndexRefreshStudioButtonProps {
  isSelectMode: boolean;
  selectedFilterKey: string | number;
  items: ModelBase[];
  totalItems: number;
}

function StudioIndexRefreshStudioButton(
  props: StudioIndexRefreshStudioButtonProps
) {
  const isRefreshing = useCommandExecuting(REFRESH_STUDIO);

  const executeCommand = useExecuteCommand();
  const { isSelectMode, selectedFilterKey, items, totalItems } = props;
  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const selectedStudioIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const studiosToRefresh =
    isSelectMode && selectedStudioIds.length > 0
      ? selectedStudioIds
      : items.map((m) => m.id);

  const refreshIndexLabel =
    selectedFilterKey === 'all'
      ? translate('UpdateAll')
      : translate('UpdateFiltered');

  const refreshSelectLabel =
    selectedStudioIds.length > 0
      ? translate('UpdateSelected')
      : translate('UpdateAll');

  const onPress = useCallback(() => {
    executeCommand({
      name: REFRESH_STUDIO,
      studioIds: studiosToRefresh,
    });
  }, [studiosToRefresh, executeCommand]);

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

export default StudioIndexRefreshStudioButton;
