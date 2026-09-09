import React, { useCallback } from 'react';
import FilterModal, {
  FilterModalPassthroughProps,
} from 'Components/Filter/FilterModal';
import { setCalendarOption } from './calendarOptionsStore';
import useCalendar, { FILTER_BUILDER } from './useCalendar';

type CalendarFilterModalProps = FilterModalPassthroughProps;

export default function CalendarFilterModal(props: CalendarFilterModalProps) {
  const { data: sectionItems } = useCalendar();

  const handleSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setCalendarOption('selectedFilterKey', selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...props}
      sectionItems={sectionItems}
      filterBuilderProps={FILTER_BUILDER}
      customFilterType="calendar"
      dispatchSetFilter={handleSetFilter}
    />
  );
}
