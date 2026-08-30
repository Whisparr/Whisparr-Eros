import React, { useMemo } from 'react';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import EnhancedSelectInput, {
  EnhancedSelectInputValue,
} from './EnhancedSelectInput';

// UI settings picks one language and the file editor picks several, so the
// value is a scalar in one place and an array in the other. Both were already
// passed here; only the file editor was typed, because the UI settings page was
// JavaScript until it came off Redux.
export interface LanguageSelectInputProps {
  name: string;
  value: number | number[];
  values: EnhancedSelectInputValue<number>[];
  onChange: (change: EnhancedSelectInputChanged<number | number[]>) => void;
}

function LanguageSelectInput({
  values,
  onChange,
  ...otherProps
}: LanguageSelectInputProps) {
  const mappedValues = useMemo(() => {
    const minId = values.reduce(
      (min: number, v) => (v.key < 1 ? v.key : min),
      values[0].key
    );

    return values.map(({ key, value }) => {
      return {
        key,
        value,
        dividerAfter: minId < 1 ? key === minId : false,
      };
    });
  }, [values]);

  return (
    <EnhancedSelectInput<
      number | number[],
      { key: number; value: string; dividerAfter: boolean }
    >
      {...otherProps}
      values={mappedValues}
      onChange={onChange}
    />
  );
}

export default LanguageSelectInput;
