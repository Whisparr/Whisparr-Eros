import React from 'react';
import FilterMenu from 'Components/Menu/FilterMenu';
import { CustomFilter, Filter } from 'Filters/Filter';
import { align } from 'Helpers/Props';
import StudioIndexFilterModal from 'Studio/Index/StudioIndexFilterModal';

interface StudioIndexFilterMenuProps {
  selectedFilterKey: string | number;
  filters: Filter[];
  customFilters: CustomFilter[];
  isDisabled: boolean;
  onFilterSelect: (filter: number | string) => void;
}

function StudioIndexFilterMenu(props: StudioIndexFilterMenuProps) {
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
      filterModalConnectorComponent={StudioIndexFilterModal}
      onFilterSelect={onFilterSelect}
    />
  );
}

StudioIndexFilterMenu.defaultProps = {
  showCustomFilters: false,
};

export default StudioIndexFilterMenu;
