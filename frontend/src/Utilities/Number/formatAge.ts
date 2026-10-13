import formatUnit from 'Utilities/Number/formatUnit';

function formatAge(
  age: number | string,
  ageHours: number | string,
  ageMinutes?: number | string
) {
  const days = Math.round(Number(age));
  const hours = Number.parseFloat(`${ageHours}`);
  const minutes = ageMinutes ? Number.parseFloat(`${ageMinutes}`) : 0;

  if (days < 2 && hours) {
    if (hours < 2 && !!minutes) {
      return formatUnit(minutes, 'minute');
    }

    return formatUnit(hours, 'hour', { maximumFractionDigits: 1 });
  }

  return formatUnit(days, 'day');
}

export default formatAge;
