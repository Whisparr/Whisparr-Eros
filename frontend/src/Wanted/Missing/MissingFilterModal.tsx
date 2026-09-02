import React, { useCallback } from 'react';
import FilterModal, {
  FilterModalPassthroughProps,
} from 'Components/Filter/FilterModal';
import { MISSING_FILTER_BUILDER_PROPS } from 'Wanted/wantedFilterBuilderProps';
import { setMissingOption } from './missingOptionsStore';
import useMissing from './useMissing';

type MissingFilterModalProps = FilterModalPassthroughProps;

export default function MissingFilterModal(
  props: Readonly<MissingFilterModalProps>
) {
  // Feeds the builder's value suggestions off the page already on screen, the
  // same way MovieIndexFilterModal does.
  const { records } = useMissing();

  const dispatchSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setMissingOption('selectedFilterKey', selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      {...props}
      sectionItems={records}
      filterBuilderProps={MISSING_FILTER_BUILDER_PROPS}
      customFilterType="wanted.missing"
      dispatchSetFilter={dispatchSetFilter}
    />
  );
}
