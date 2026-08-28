import translate from 'Utilities/String/translate';

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
      return `${minutes.toFixed(0)} ${hours === 1 ? translate('FormatAgeMinute') : translate('FormatAgeMinutes')}`;
    }

    return `${hours.toFixed(1)} ${hours === 1 ? translate('FormatAgeHour') : translate('FormatAgeHours')}`;
  }

  return `${days} ${days === 1 ? translate('FormatAgeDay') : translate('FormatAgeDays')}`;
}

export default formatAge;
