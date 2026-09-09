import React, { useCallback, useState } from 'react';
import Modal from 'Components/Modal/Modal';
import { CustomFilter, FilterBuilderProp } from 'Filters/Filter';
import FilterBuilderModalContent from './Builder/FilterBuilderModalContent';
import CustomFiltersModalContent from './CustomFilters/CustomFiltersModalContent';

export interface FilterModalProps<T> {
  isOpen: boolean;
  selectedFilterKey: string | number;
  customFilterType: string;
  customFilters: CustomFilter[];
  sectionItems: ReadonlyArray<T>;
  filterBuilderProps: FilterBuilderProp<T>[];
  dispatchSetFilter: (payload: { selectedFilterKey: string | number }) => void;
  onModalClose: () => void;
}

// What `FilterMenu` supplies to every one of the per-section wrappers, which
// pass it straight through and add the section's own half.
export type FilterModalPassthroughProps = Omit<
  FilterModalProps<never>,
  | 'customFilterType'
  | 'sectionItems'
  | 'filterBuilderProps'
  | 'dispatchSetFilter'
>;

function FilterModal<T>({ isOpen, ...otherProps }: FilterModalProps<T>) {
  const { onModalClose } = otherProps;

  // Opening the modal with no custom filters saved goes straight to the
  // builder. Read once, as the class read it in its constructor: the modal
  // stays mounted behind `isOpen`.
  const [filterBuilder, setFilterBuilder] = useState(
    !otherProps.customFilters.length
  );
  const [id, setId] = useState<number | null>(null);

  const handleAddCustomFilter = useCallback(() => {
    setFilterBuilder(true);
  }, []);

  const handleEditCustomFilter = useCallback((customFilterId: number) => {
    setFilterBuilder(true);
    setId(customFilterId);
  }, []);

  const handleModalClose = useCallback(() => {
    setFilterBuilder(false);
    setId(null);
    onModalClose();
  }, [onModalClose]);

  // Cancelling the builder goes back to the list rather than closing, unless
  // the list is what is on screen.
  const handleCancelPress = useCallback(() => {
    if (filterBuilder) {
      setFilterBuilder(false);
      setId(null);
    } else {
      handleModalClose();
    }
  }, [filterBuilder, handleModalClose]);

  return (
    <Modal isOpen={isOpen} onModalClose={handleModalClose}>
      {filterBuilder ? (
        <FilterBuilderModalContent
          {...otherProps}
          id={id}
          onCancelPress={handleCancelPress}
          onModalClose={handleModalClose}
        />
      ) : (
        <CustomFiltersModalContent
          {...otherProps}
          onAddCustomFilter={handleAddCustomFilter}
          onEditCustomFilter={handleEditCustomFilter}
          onModalClose={handleModalClose}
        />
      )}
    </Modal>
  );
}

export default FilterModal;
