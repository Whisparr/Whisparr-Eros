import React, { useCallback } from 'react';
import FilterModal from 'Components/Filter/FilterModal';
import { Filter } from 'Filters/Filter';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import { PERFORMER_INDEX_FILTER_BUILDER_PROPS } from './performerIndexFilterBuilderProps';
import { setPerformerIndexFilter } from './performerIndexOptionsStore';
import { usePerformerIndex } from './usePerformerIndex';

interface PerformerIndexFilterModalProps {
  isOpen: boolean;
  customFilters: Filter[];
}

export default function PerformerIndexFilterModal(
  props: Readonly<PerformerIndexFilterModalProps>
) {
  // `sectionItems` feeds the filter builder's value suggestions. It used to
  // read `state.performers.items`, which nothing populates -- `fetchPerformers`
  // is never dispatched -- so it was always empty. No performer row derives its
  // options from the loaded items, so nothing looked wrong; it takes the page's
  // items now regardless.
  const { items: sectionItems } = usePerformerIndex();
  const customFilterType = 'performers';
  const customFilters = useCustomFiltersList(customFilterType);

  const dispatchSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setPerformerIndexFilter(selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...props}
      sectionItems={sectionItems}
      filterBuilderProps={PERFORMER_INDEX_FILTER_BUILDER_PROPS}
      customFilterType={customFilterType}
      dispatchSetFilter={dispatchSetFilter}
      customFilters={customFilters}
    />
  );
}
