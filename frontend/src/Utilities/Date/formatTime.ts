import moment from 'moment';

interface FormatTimeOptions {
  includeMinuteZero?: boolean;
  includeSeconds?: boolean;
}

function formatTime(
  date: string | Date | null | undefined,
  timeFormat: string | undefined,
  { includeMinuteZero = false, includeSeconds = false }: FormatTimeOptions = {}
) {
  if (!date || !timeFormat) {
    return '';
  }

  const time = moment(date);

  let format = timeFormat;

  if (includeSeconds) {
    format = format.replace(/\(?:mm\)?/, ':mm:ss');
  } else if (includeMinuteZero || time.minute() !== 0) {
    format = format.replace('(:mm)', ':mm');
  } else {
    format = format.replace('(:mm)', '');
  }

  return time.format(format);
}

export default formatTime;
