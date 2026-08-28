import React from 'react';
import FilterMenu from 'Components/Menu/FilterMenu';
import { CustomFilter, Filter } from 'Filters/Filter';
import MovieIndexFilterModal from 'Movie/Index/MovieIndexFilterModal';

interface MovieIndexFilterMenuProps {
  selectedFilterKey: string | number;
  filters: Filter[];
  customFilters: CustomFilter[];
  isDisabled: boolean;
  onFilterSelect: (filter: number | string) => void;
}

function MovieIndexFilterMenu(props: MovieIndexFilterMenuProps) {
  const {
    selectedFilterKey,
    filters,
    customFilters,
    isDisabled,
    onFilterSelect,
  } = props;

  return (
    <FilterMenu
      alignMenu="right"
      isDisabled={isDisabled}
      selectedFilterKey={selectedFilterKey}
      filters={filters}
      customFilters={customFilters}
      filterModalConnectorComponent={MovieIndexFilterModal}
      onFilterSelect={onFilterSelect}
    />
  );
}

export default MovieIndexFilterMenu;
