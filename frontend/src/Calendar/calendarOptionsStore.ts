import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';
import { CalendarView } from './calendarViews';

export interface CalendarOptions {
  showMovieInformation: boolean;
  showCutoffUnmetIcon: boolean;
  fullColorEvents: boolean;
  selectedFilterKey: string | number;
  view: CalendarView;
}

const { useOptions, useOption, getOption, setOption } =
  createOptionsStore<CalendarOptions>('calendar_options', () => {
    return {
      showMovieInformation: true,
      showCutoffUnmetIcon: false,
      fullColorEvents: false,
      selectedFilterKey: 'monitored',
      view: window.innerWidth > 768 ? 'month' : 'day',
    };
  });

export const useCalendarOptions = useOptions;
export const useCalendarOption = useOption;
export const getCalendarOption = getOption;
export const setCalendarOption = setOption;
