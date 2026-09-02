import React, { useCallback } from 'react';
import FilterModal, {
  FilterModalPassthroughProps,
} from 'Components/Filter/FilterModal';
import { CUTOFF_UNMET_FILTER_BUILDER_PROPS } from 'Wanted/wantedFilterBuilderProps';
import { setCutoffUnmetOption } from './cutoffUnmetOptionsStore';
import useCutoffUnmet from './useCutoffUnmet';

type CutoffUnmetFilterModalProps = FilterModalPassthroughProps;

export default function CutoffUnmetFilterModal(
  props: Readonly<CutoffUnmetFilterModalProps>
) {
  // Feeds the builder's value suggestions off the page already on screen, the
  // same way MovieIndexFilterModal does.
  const { records } = useCutoffUnmet();

  const dispatchSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setCutoffUnmetOption('selectedFilterKey', selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      {...props}
      sectionItems={records}
      filterBuilderProps={CUTOFF_UNMET_FILTER_BUILDER_PROPS}
      customFilterType="wanted.cutoffUnmet"
      dispatchSetFilter={dispatchSetFilter}
    />
  );
}
