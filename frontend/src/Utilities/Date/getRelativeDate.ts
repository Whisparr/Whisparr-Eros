import moment from 'moment-timezone';
import translate from 'Utilities/String/translate';
import { convertToTimezone } from './convertToTimezone';
import formatDateTime from './formatDateTime';

interface GetRelativeDateOptions {
  date?: string;
  shortDateFormat: string;
  showRelativeDates: boolean;
  timeFormat?: string;
  timeZone?: string;
  includeSeconds?: boolean;
  timeForToday?: boolean;
  includeTime?: boolean;
  ignoreTimezone?: boolean;
}

function getRelativeDate({
  date,
  shortDateFormat,
  showRelativeDates,
  timeFormat,
  timeZone = '',
  includeSeconds = false,
  timeForToday = false,
  includeTime = false,
  ignoreTimezone = false,
}: GetRelativeDateOptions) {
  if (date == null || date === '') {
    return '';
  }

  if (
    (includeTime || timeForToday) &&
    (timeFormat == null || timeFormat === '')
  ) {
    throw new Error(
      "getRelativeDate: 'timeFormat' is required when 'includeTime' or 'timeForToday' is true"
    );
  }
  // Detect date-only strings (YYYY-MM-DD) or midnight-UTC timestamps
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(date || '');
  const isMidnightUtc = /T00:00:00(?:\.000)?Z$/.test(date || '');

  const useUtcCalendar = Boolean(ignoreTimezone || isDateOnly || isMidnightUtc);

  // Parse date and reference 'now' in the same mode (UTC, configured zone, or
  // local). The UTC calendar path deliberately ignores timeZone: a date-only
  // value carries no time of day, so converting it would move the calendar day
  // rather than the clock time.
  const zoned = (value?: string) => {
    if (value == null) {
      return timeZone ? moment.tz(timeZone) : moment();
    }

    return convertToTimezone(value, timeZone);
  };

  const m = useUtcCalendar ? moment.utc(date) : zoned(date);
  const now = useUtcCalendar ? moment.utc() : zoned();

  // Small local time formatter that mirrors Utilities/Date/formatTime behavior
  const time = timeFormat
    ? (() => {
        let tf = timeFormat;
        const t = m.clone();

        if (includeSeconds) {
          tf = tf.replace(/\(?:mm\)?/, ':mm:ss');
        } else if (t.minute() === 0) {
          tf = tf.replace('(:mm)', '');
        } else {
          tf = tf.replace('(:mm)', ':mm');
        }

        return t.format(tf);
      })()
    : '';

  const isTodayDate = m.isSame(now, 'day');

  if (isTodayDate && timeForToday) {
    return time;
  }

  if (showRelativeDates === false) {
    return m.format(shortDateFormat);
  }

  const isYesterdayDate = m.isSame(now.clone().subtract(1, 'day'), 'day');
  if (isYesterdayDate) {
    return includeTime
      ? translate('YesterdayAt', { time })
      : translate('Yesterday');
  }

  if (isTodayDate) {
    return includeTime ? translate('TodayAt', { time }) : translate('Today');
  }

  const isTomorrowDate = m.isSame(now.clone().add(1, 'day'), 'day');
  if (isTomorrowDate) {
    return includeTime
      ? translate('TomorrowAt', { time })
      : translate('Tomorrow');
  }

  const diffDays = m.startOf('day').diff(now.startOf('day'), 'days');
  if (diffDays > 0 && diffDays <= 7) {
    const day = m.format('dddd');
    return includeTime ? translate('DayOfWeekAt', { day, time }) : day;
  }

  return includeTime
    ? formatDateTime(date, shortDateFormat, timeFormat, {
        includeSeconds,
        timeZone: useUtcCalendar ? '' : timeZone,
      })
    : m.format(shortDateFormat);
}

export default getRelativeDate;
