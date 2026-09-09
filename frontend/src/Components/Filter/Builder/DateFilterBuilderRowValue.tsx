import React, { useCallback, useEffect } from 'react';
import NumberInput from 'Components/Form/NumberInput';
import SelectInput from 'Components/Form/SelectInput';
import TextInput from 'Components/Form/TextInput';
import usePrevious from 'Helpers/Hooks/usePrevious';
import {
  DateFilterValue,
  IN_LAST,
  IN_NEXT,
  NOT_IN_LAST,
  NOT_IN_NEXT,
} from 'Helpers/Props/filterTypes';
import { InputChanged } from 'typings/inputs';
import isString from 'Utilities/String/isString';
import translate from 'Utilities/String/translate';
import { NAME } from './FilterBuilderRowValue';
import FilterBuilderRowValueProps from './FilterBuilderRowValueProps';
import styles from './DateFilterBuilderRowValue.css';

type DateFilterBuilderRowValueProps = Pick<
  FilterBuilderRowValueProps,
  'filterType' | 'filterValue' | 'onChange'
>;

const timeOptions = [
  {
    key: 'seconds',
    get value() {
      return translate('Seconds');
    },
  },
  {
    key: 'minutes',
    get value() {
      return translate('Minutes');
    },
  },
  {
    key: 'hours',
    get value() {
      return translate('Hours');
    },
  },
  {
    key: 'days',
    get value() {
      return translate('Days');
    },
  },
  {
    key: 'weeks',
    get value() {
      return translate('Weeks');
    },
  },
  {
    key: 'months',
    get value() {
      return translate('Months');
    },
  },
];

function isInFilter(filterType?: string) {
  return (
    filterType === IN_LAST ||
    filterType === NOT_IN_LAST ||
    filterType === IN_NEXT ||
    filterType === NOT_IN_NEXT
  );
}

function DateFilterBuilderRowValue({
  filterType,
  filterValue,
  onChange,
}: Readonly<DateFilterBuilderRowValueProps>) {
  const previousFilterType = usePrevious(filterType);

  // `isString` cannot be a type predicate -- it answers true for a boxed
  // `String` as well -- so the in-last/in-next shape is asserted where the
  // checks above have already established it.
  const dateValue = filterValue as DateFilterValue;

  const handleValueChange = useCallback(
    ({ value }: InputChanged<string | number | null>) => {
      // The date input sends its string straight through; the number input
      // owns only half of the in-last/in-next pair, so it is merged with the
      // unit beside it.
      const newValue = isString(value)
        ? (value as string)
        : { time: dateValue.time, value: value as number | null };

      onChange({
        name: NAME,
        value: newValue,
      });
    },
    [dateValue, onChange]
  );

  const handleTimeChange = useCallback(
    ({ value }: InputChanged<string>) => {
      onChange({
        name: NAME,
        value: {
          time: value,
          value: dateValue.value,
        },
      });
    },
    [dateValue, onChange]
  );

  // A filter loaded as in-last/in-next but still holding a date string has no
  // pair for the inputs below to render, so it is seeded on mount.
  useEffect(() => {
    if (isInFilter(filterType) && isString(filterValue)) {
      onChange({
        name: NAME,
        value: {
          time: timeOptions[0].key,
          value: null,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switching the type between the two shapes swaps the value with it. Only a
  // change of type does; `previousFilterType` is undefined on the first render,
  // which is where the mount effect above takes over.
  useEffect(() => {
    if (previousFilterType === undefined || previousFilterType === filterType) {
      return;
    }

    if (isInFilter(filterType) && isString(filterValue)) {
      onChange({
        name: NAME,
        value: {
          time: timeOptions[0].key,
          value: null,
        },
      });

      return;
    }

    if (!isInFilter(filterType) && !isString(filterValue)) {
      onChange({
        name: NAME,
        value: '',
      });
    }
  }, [filterType, previousFilterType, filterValue, onChange]);

  if (
    (isInFilter(filterType) && isString(filterValue)) ||
    (!isInFilter(filterType) && !isString(filterValue))
  ) {
    return null;
  }

  if (isInFilter(filterType)) {
    return (
      <div className={styles.container}>
        <NumberInput
          className={styles.numberInput}
          name={NAME}
          value={dateValue.value}
          onChange={handleValueChange}
        />

        <SelectInput
          className={styles.selectInput}
          name={NAME}
          value={dateValue.time}
          values={timeOptions}
          onChange={handleTimeChange}
        />
      </div>
    );
  }

  return (
    <TextInput
      name={NAME}
      value={filterValue as string}
      type="date"
      placeholder="yyyy-mm-dd"
      onChange={handleValueChange}
    />
  );
}

export default DateFilterBuilderRowValue;
