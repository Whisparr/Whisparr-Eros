import { keepPreviousData } from '@tanstack/react-query';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { create } from 'zustand';
import AppState from 'App/State/AppState';
import { Filter, FilterBuilderProp } from 'Filters/Filter';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import {
  filterBuilderTypes,
  filterBuilderValueTypes,
  filterTypes,
} from 'Helpers/Props';
import { CalendarItem } from 'typings/Calendar';
import findSelectedFilters from 'Utilities/Filter/findSelectedFilters';
import translate from 'Utilities/String/translate';
import { getCalendarOption, useCalendarOption } from './calendarOptionsStore';
import { CalendarView } from './calendarViews';

export const FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [
      {
        key: 'unmonitored',
        value: [true],
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'monitored',
    label: () => translate('MonitoredOnly'),
    filters: [
      {
        key: 'unmonitored',
        value: [false],
        type: filterTypes.EQUAL,
      },
    ],
  },
];

export const FILTER_BUILDER: FilterBuilderProp<CalendarItem>[] = [
  {
    name: 'unmonitored',
    label: () => translate('IncludeUnmonitored'),
    type: filterBuilderTypes.EQUAL,
    valueType: filterBuilderValueTypes.BOOL,
  },
  {
    name: 'tags',
    label: () => translate('Tags'),
    type: filterBuilderTypes.CONTAINS,
    valueType: filterBuilderValueTypes.TAG,
  },
];

interface CalendarStore {
  time: moment.Moment;
  start?: string;
  end?: string;
  dates: string[];
  dayCount: number;
  searchMissingCommandId?: number;
}

// Where the user currently is in the calendar. This is navigation state, not
// user preference, so it deliberately isn't persisted — `calendarOptionsStore`
// holds the parts that are.
const calendarStore = create<CalendarStore>(() => ({
  time: moment(),
  dates: [],
  dayCount: 7,
}));

const VIEW_RANGES: Record<
  CalendarView,
  moment.unitOfTime.DurationConstructor | undefined
> = {
  agenda: undefined,
  day: 'day',
  week: 'week',
  month: 'month',
  forecast: 'day',
};

const DEFAULT_ITEMS: CalendarItem[] = [];

const getDays = (start: moment.Moment, end: moment.Moment) => {
  const startTime = moment(start);
  const endTime = moment(end);
  const difference = endTime.diff(startTime, 'days');

  // Difference is one less than the number of days we need to account for.
  return Array(difference + 1)
    .fill(0)
    .map((_, i) => startTime.clone().add(i, 'days').toISOString());
};

const getDates = (
  time: moment.Moment,
  view: CalendarView,
  firstDayOfWeek: number,
  dayCount: number
) => {
  const weekName = firstDayOfWeek === 0 ? 'week' : 'isoWeek';

  let start = time.clone().startOf('day');
  let end = time.clone().endOf('day');

  if (view === 'week') {
    start = time.clone().startOf(weekName);
    end = time.clone().endOf(weekName);
  }

  if (view === 'forecast') {
    start = time.clone().subtract(1, 'day').startOf('day');
    end = time
      .clone()
      .add(dayCount - 2, 'days')
      .endOf('day');
  }

  if (view === 'month') {
    start = time.clone().startOf('month').startOf(weekName);
    end = time.clone().endOf('month').endOf(weekName);
  }

  if (view === 'agenda') {
    start = time.clone().subtract(1, 'day').startOf('day');
    end = time.clone().add(1, 'month').endOf('day');
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    dates: getDays(start, end),
  };
};

// The calendar fetches a wider range than it displays so that stepping to an
// adjacent range is already in the React Query cache.
const getPopulatableRange = (
  startDate: string | undefined,
  endDate: string | undefined,
  view: CalendarView
) => {
  if (!startDate || !endDate) {
    return { start: undefined, end: undefined };
  }

  switch (view) {
    case 'day':
      return {
        start: moment(startDate).subtract(1, 'day').toISOString(),
        end: moment(endDate).add(1, 'day').toISOString(),
      };
    case 'week':
    case 'forecast':
      return {
        start: moment(startDate).subtract(1, 'week').toISOString(),
        end: moment(endDate).add(1, 'week').toISOString(),
      };
    default:
      return {
        start: startDate,
        end: endDate,
      };
  }
};

export const useCalendarTime = () => {
  return calendarStore((state) => state.time);
};

export const useCalendarDates = () => {
  return calendarStore((state) => state.dates);
};

export const useCalendarDayCount = () => {
  return calendarStore((state) => state.dayCount);
};

export const useCalendarRange = () => {
  const start = calendarStore((state) => state.start);
  const end = calendarStore((state) => state.end);

  return { start, end };
};

export const useCalendarSearchMissingCommandId = () => {
  return calendarStore((state) => state.searchMissingCommandId);
};

export const setCalendarDayCount = (dayCount: number) => {
  calendarStore.setState({ dayCount });
};

export const setCalendarSearchMissingCommandId = (
  searchMissingCommandId: number
) => {
  calendarStore.setState({ searchMissingCommandId });
};

export const goToToday = () => {
  calendarStore.setState({ time: moment() });
};

export const goToPreviousRange = () => {
  const { dayCount, time } = calendarStore.getState();
  const view = getCalendarOption('view');
  const amount = view === 'forecast' ? dayCount : 1;

  calendarStore.setState({
    time: moment(time).subtract(amount, VIEW_RANGES[view]),
  });
};

export const goToNextRange = () => {
  const { dayCount, time } = calendarStore.getState();
  const view = getCalendarOption('view');
  const amount = view === 'forecast' ? dayCount : 1;

  calendarStore.setState({
    time: moment(time).add(amount, VIEW_RANGES[view]),
  });
};

// Recomputes the visible range whenever anything it derives from changes. The
// page renders this once; every other consumer reads the result.
export const useCalendarPage = () => {
  const time = useCalendarTime();
  const dayCount = useCalendarDayCount();
  const view = useCalendarOption('view');

  const firstDayOfWeek = useSelector(
    (state: AppState) => state.settings.ui.item.firstDayOfWeek
  );

  useEffect(() => {
    calendarStore.setState(getDates(time, view, firstDayOfWeek, dayCount));
  }, [time, view, firstDayOfWeek, dayCount]);
};

const useCalendar = () => {
  const { start: rangeStart, end: rangeEnd } = useCalendarRange();
  const view = useCalendarOption('view');
  const selectedFilterKey = useCalendarOption('selectedFilterKey');

  const customFilters = useCustomFiltersList('calendar');

  const { start, end } = useMemo(() => {
    return getPopulatableRange(rangeStart, rangeEnd, view);
  }, [rangeStart, rangeEnd, view]);

  const { unmonitored, tags } = useMemo(() => {
    const selectedFilters = findSelectedFilters(
      selectedFilterKey,
      FILTERS,
      customFilters
    );

    return selectedFilters.reduce<{ unmonitored: boolean; tags?: string }>(
      (acc, filter) => {
        if (filter.key === 'unmonitored' && Array.isArray(filter.value)) {
          acc.unmonitored = (filter.value as boolean[]).includes(true);
        }

        // The API takes tags as a comma separated string, not repeated params.
        if (filter.key === 'tags' && Array.isArray(filter.value)) {
          acc.tags = (filter.value as number[]).join(',');
        }

        return acc;
      },
      { unmonitored: false }
    );
  }, [selectedFilterKey, customFilters]);

  const { data, ...query } = useApiQuery<CalendarItem[]>({
    path: '/calendar',
    queryParams: {
      start,
      end,
      unmonitored,
      tags,
    },
    queryOptions: {
      enabled: !!start && !!end,
      placeholderData: keepPreviousData,
    },
  });

  return { ...query, data: data ?? DEFAULT_ITEMS };
};

export default useCalendar;
