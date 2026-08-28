import React, { useCallback } from 'react';
import FilterModal, {
  FilterModalPassthroughProps,
} from 'Components/Filter/FilterModal';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import { PERFORMER_INDEX_FILTER_BUILDER_PROPS } from './performerIndexFilterBuilderProps';
import { setPerformerIndexFilter } from './performerIndexOptionsStore';
import { usePerformerIndex } from './usePerformerIndex';

// The menu passes its own `customFilters` down like every other section's
// wrapper does; this one has always overridden them with its own fetch below.
type PerformerIndexFilterModalProps = FilterModalPassthroughProps;

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
