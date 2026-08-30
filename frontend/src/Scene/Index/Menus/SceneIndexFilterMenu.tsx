import React from 'react';
import FilterMenu from 'Components/Menu/FilterMenu';
import { CustomFilter, Filter } from 'Filters/Filter';
import { align } from 'Helpers/Props';
import SceneIndexFilterModal from 'Scene/Index/SceneIndexFilterModal';

interface SceneIndexFilterMenuProps {
  selectedFilterKey: string | number;
  filters: Filter[];
  customFilters: CustomFilter[];
  isDisabled: boolean;
  onFilterSelect: (filter: number | string) => void;
}

function SceneIndexFilterMenu(props: SceneIndexFilterMenuProps) {
  const {
    selectedFilterKey,
    filters,
    customFilters,
    isDisabled,
    onFilterSelect,
  } = props;

  return (
    <FilterMenu
      alignMenu={align.RIGHT}
      isDisabled={isDisabled}
      selectedFilterKey={selectedFilterKey}
      filters={filters}
      customFilters={customFilters}
      filterModalConnectorComponent={SceneIndexFilterModal}
      onFilterSelect={onFilterSelect}
    />
  );
}

SceneIndexFilterMenu.defaultProps = {
  showCustomFilters: false,
};

export default SceneIndexFilterMenu;
