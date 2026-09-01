import moment from 'moment-timezone';

export function convertToTimezone(
  date: string | Date | null | undefined,
  timeZone: string | undefined
) {
  if (!date) {
    return moment();
  }

  if (!timeZone) {
    return moment(date);
  }

  try {
    return moment.tz(date, timeZone);
  } catch (error) {
    console.warn(
      `Error converting to timezone ${timeZone}. Using system timezone.`,
      error
    );

    return moment(date);
  }
}

export default convertToTimezone;
