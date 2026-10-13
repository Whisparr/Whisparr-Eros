import moment from 'moment';

interface FormatUnitOptions {
  maximumFractionDigits?: number;
  unitDisplay?: 'long' | 'short' | 'narrow';
}

function formatUnit(
  value: number,
  unit: 'second' | 'minute' | 'hour' | 'day',
  { maximumFractionDigits = 0, unitDisplay = 'long' }: FormatUnitOptions = {}
) {
  return new Intl.NumberFormat(moment.locale(), {
    style: 'unit',
    unit,
    unitDisplay,
    maximumFractionDigits,
  }).format(value);
}

export default formatUnit;
