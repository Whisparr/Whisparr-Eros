import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as commandNames from 'Commands/commandNames';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import useCurrentPage from 'Helpers/Hooks/useCurrentPage';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { kinds } from 'Helpers/Props';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import {
  registerPagePopulator,
  unregisterPagePopulator,
} from 'Utilities/pagePopulator';
import translate from 'Utilities/String/translate';
import Agenda from './Agenda/Agenda';
import { useCalendarOption } from './calendarOptionsStore';
import CalendarDays from './Day/CalendarDays';
import DaysOfWeek from './Day/DaysOfWeek';
import CalendarHeader from './Header/CalendarHeader';
import useCalendar, { goToToday, useCalendarTime } from './useCalendar';
import styles from './Calendar.css';

const UPDATE_DELAY = 3600000; // 1 hour

function Calendar() {
  const requestCurrentPage = useCurrentPage();
  const updateTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const { isFetching, isFetched, error, refetch } = useCalendar();

  const view = useCalendarOption('view');
  const time = useCalendarTime();

  const isRefreshingMovie = useSelector(
    createCommandExecutingSelector(commandNames.REFRESH_MOVIE)
  );

  const wasRefreshingMovie = usePrevious(isRefreshingMovie);

  const handleScheduleUpdate = useCallback(() => {
    clearTimeout(updateTimeout.current);

    function updateCalendar() {
      goToToday();
      updateTimeout.current = setTimeout(updateCalendar, UPDATE_DELAY);
    }

    updateTimeout.current = setTimeout(updateCalendar, UPDATE_DELAY);
  }, []);

  useEffect(() => {
    handleScheduleUpdate();

    return () => {
      clearTimeout(updateTimeout.current);
    };
  }, [handleScheduleUpdate]);

  useEffect(() => {
    if (!requestCurrentPage) {
      goToToday();
    }
  }, [requestCurrentPage]);

  useEffect(() => {
    registerPagePopulator(refetch, ['movieFileUpdated', 'movieFileDeleted']);

    return () => {
      unregisterPagePopulator(refetch);
    };
  }, [refetch]);

  useEffect(() => {
    handleScheduleUpdate();
  }, [time, handleScheduleUpdate]);

  useEffect(() => {
    if (wasRefreshingMovie && !isRefreshingMovie) {
      refetch();
    }
  }, [isRefreshingMovie, wasRefreshingMovie, refetch]);

  return (
    <div className={styles.calendar}>
      {isFetching && !isFetched ? <LoadingIndicator /> : null}

      {!isFetching && error ? (
        <Alert kind={kinds.DANGER}>{translate('CalendarLoadError')}</Alert>
      ) : null}

      {!error && isFetched && view === 'agenda' ? (
        <div className={styles.calendarContent}>
          <CalendarHeader />
          <Agenda />
        </div>
      ) : null}

      {!error && isFetched && view !== 'agenda' ? (
        <div className={styles.calendarContent}>
          <CalendarHeader />
          <DaysOfWeek />
          <CalendarDays />
        </div>
      ) : null}
    </div>
  );
}

export default Calendar;
