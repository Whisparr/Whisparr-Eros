import React, { useCallback } from 'react';
import FilterModal from 'Components/Filter/FilterModal';
import History from 'typings/History';
import { setHistoryOption } from './historyOptionsStore';
import { FILTER_BUILDER } from './useHistory';

interface HistoryFilterModalProps {
  isOpen: boolean;
  sectionItems: History[];
}

export default function HistoryFilterModal({
  sectionItems,
  ...otherProps
}: HistoryFilterModalProps) {
  const handleSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setHistoryOption('selectedFilterKey', selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...otherProps}
      sectionItems={sectionItems}
      filterBuilderProps={FILTER_BUILDER}
      customFilterType="history"
      dispatchSetFilter={handleSetFilter}
    />
  );
}
