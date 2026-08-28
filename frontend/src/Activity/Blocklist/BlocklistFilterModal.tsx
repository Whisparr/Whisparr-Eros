import React, { useCallback } from 'react';
import FilterModal, {
  FilterModalPassthroughProps,
} from 'Components/Filter/FilterModal';
import Blocklist from 'typings/Blocklist';
import { setBlocklistOption } from './blocklistOptionsStore';
import { FILTER_BUILDER } from './useBlocklist';

interface BlocklistFilterModalProps extends FilterModalPassthroughProps {
  sectionItems: Blocklist[];
}

export default function BlocklistFilterModal({
  sectionItems,
  ...otherProps
}: BlocklistFilterModalProps) {
  const handleSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setBlocklistOption('selectedFilterKey', selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...otherProps}
      sectionItems={sectionItems}
      filterBuilderProps={FILTER_BUILDER}
      customFilterType="blocklist"
      dispatchSetFilter={handleSetFilter}
    />
  );
}
