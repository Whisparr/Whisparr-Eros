import classNames from 'classnames';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useCalendarOption } from 'Calendar/calendarOptionsStore';
import * as calendarViews from 'Calendar/calendarViews';
import CalendarEvent from 'Calendar/Events/CalendarEvent';
import useCalendar, { useCalendarTime } from 'Calendar/useCalendar';
import { CalendarEvent as CalendarEventModel } from 'typings/Calendar';
import styles from './CalendarDay.css';

function sort(items: CalendarEventModel[]) {
  return items.sort((a, b) => {
    const aDate = moment(a.releaseDate).unix();
    const bDate = moment(b.releaseDate).unix();

    return aDate - bDate;
  });
}

function useCalendarEvents(date: string) {
  const { data: items } = useCalendar();

  return useMemo(() => {
    const momentDate = moment(date);

    const filtered = items.filter(({ releaseDate }) => {
      return releaseDate && momentDate.isSame(moment(releaseDate), 'day');
    });

    return sort(
      filtered.map((item) => ({
        isGroup: false,
        ...item,
      }))
    );
  }, [date, items]);
}

interface CalendarDayProps {
  date: string;
  isTodaysDate: boolean;
}

function CalendarDay({ date, isTodaysDate }: CalendarDayProps) {
  const time = useCalendarTime();
  const view = useCalendarOption('view');
  const events = useCalendarEvents(date);

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isTodaysDate && view === calendarViews.MONTH && ref.current) {
      ref.current.scrollIntoView();
    }
  }, [time, isTodaysDate, view]);

  return (
    <div
      ref={ref}
      className={classNames(
        styles.day,
        view === calendarViews.DAY && styles.isSingleDay
      )}
    >
      {view === calendarViews.MONTH && (
        <div
          className={classNames(
            styles.dayOfMonth,
            isTodaysDate && styles.isToday,
            !moment(date).isSame(moment(time), 'month') &&
              styles.isDifferentMonth
          )}
        >
          {moment(date).date()}
        </div>
      )}
      <div>
        {events.map((event) => {
          return (
            <CalendarEvent key={event.id} {...event} date={date as string} />
          );
        })}
      </div>
    </div>
  );
}

export default CalendarDay;
