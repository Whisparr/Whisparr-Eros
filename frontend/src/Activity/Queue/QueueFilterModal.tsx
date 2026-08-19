import React, { useCallback } from 'react';
import FilterModal from 'Components/Filter/FilterModal';
import Queue from 'typings/Queue';
import { setQueueOption } from './queueOptionsStore';
import { FILTER_BUILDER } from './useQueue';

interface QueueFilterModalProps {
  isOpen: boolean;
  sectionItems: Queue[];
}

export default function QueueFilterModal({
  sectionItems,
  ...otherProps
}: QueueFilterModalProps) {
  const handleSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setQueueOption('selectedFilterKey', selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...otherProps}
      sectionItems={sectionItems}
      filterBuilderProps={FILTER_BUILDER}
      customFilterType="queue"
      dispatchSetFilter={handleSetFilter}
    />
  );
}
