import React, { useCallback } from 'react';
import FilterModal, {
  FilterModalPassthroughProps,
} from 'Components/Filter/FilterModal';
import { STUDIO_INDEX_FILTER_BUILDER_PROPS } from './studioIndexFilterBuilderProps';
import { setStudioIndexFilter } from './studioIndexOptionsStore';
import { useStudioIndex } from './useStudioIndex';

type StudioIndexFilterModalProps = FilterModalPassthroughProps;

export default function StudioIndexFilterModal(
  props: StudioIndexFilterModalProps
) {
  // `sectionItems` feeds the filter builder's value suggestions -- the Network
  // row builds its list from them. It used to read `state.studios.items`, which
  // nothing populates now that the index is paged, so Network offered nothing.
  // `useStudioIndex` returns the page the index is already showing, off the same
  // cached query: fewer values than the whole library, but real ones.
  const { items: sectionItems } = useStudioIndex();
  const customFilterType = 'studios';

  // Setting the filter resets the page, so no separate page dispatch is needed.
  const dispatchSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setStudioIndexFilter(selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...props}
      sectionItems={sectionItems}
      filterBuilderProps={STUDIO_INDEX_FILTER_BUILDER_PROPS}
      customFilterType={customFilterType}
      dispatchSetFilter={dispatchSetFilter}
    />
  );
}
