import React, { useCallback, useMemo } from 'react';
import {
  useIndexerFlags,
  useSelectedIndexerFlags,
} from 'Settings/Indexers/useIndexerFlags';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import EnhancedSelectInput from './EnhancedSelectInput';

export interface IndexerFlagsSelectInputProps {
  name: string;
  indexerFlags: number;
  onChange(payload: EnhancedSelectInputChanged<number>): void;
}

function IndexerFlagsSelectInput({
  name,
  indexerFlags,
  onChange,
  ...otherProps
}: Readonly<IndexerFlagsSelectInputProps>) {
  const { data: allIndexerFlags } = useIndexerFlags();
  const { data: selectedFlags } = useSelectedIndexerFlags(indexerFlags);

  const value = useMemo(() => {
    return selectedFlags.map(({ id }) => id);
  }, [selectedFlags]);

  const values = useMemo(() => {
    return allIndexerFlags.map(({ id, name: flagName }) => ({
      key: id,
      value: flagName,
    }));
  }, [allIndexerFlags]);

  const handleChange = useCallback(
    (change: EnhancedSelectInputChanged<number[]>) => {
      const newIndexerFlags = change.value.reduce(
        (acc, flagId) => acc + flagId,
        0
      );

      onChange({ name, value: newIndexerFlags });
    },
    [name, onChange]
  );

  return (
    <EnhancedSelectInput
      {...otherProps}
      name={name}
      value={value}
      values={values}
      onChange={handleChange}
    />
  );
}

export default IndexerFlagsSelectInput;
