import moment from 'moment';
import translate from 'Utilities/String/translate';
import formatTime from './formatTime';
import isToday from './isToday';
import isTomorrow from './isTomorrow';
import isYesterday from './isYesterday';

interface FormatDateTimeOptions {
  includeSeconds?: boolean;
  includeRelativeDay?: boolean;
}

function getRelativeDay(date: string | Date, includeRelativeDate: boolean) {
  if (!includeRelativeDate) {
    return '';
  }

  if (isYesterday(date)) {
    return translate('Yesterday');
  }

  if (isToday(date)) {
    return translate('Today');
  }

  if (isTomorrow(date)) {
    return translate('Tomorrow');
  }

  return '';
}

function formatDateTime(
  date: string | Date | null | undefined,
  dateFormat: string | undefined,
  timeFormat: string | undefined,
  {
    includeSeconds = false,
    includeRelativeDay = false,
  }: FormatDateTimeOptions = {}
) {
  if (!date) {
    return '';
  }

  const relativeDay = getRelativeDay(date, includeRelativeDay);
  const formattedDate = dateFormat ? moment(date).format(dateFormat) : '';
  const formattedTime = formatTime(date, timeFormat, {
    includeMinuteZero: true,
    includeSeconds,
  });

  if (relativeDay) {
    return translate('FormatDateTimeRelative', {
      relativeDay,
      formattedDate,
      formattedTime,
    });
  }
  return translate('FormatDateTime', { formattedDate, formattedTime });
}

export default formatDateTime;
