import React, { useMemo } from 'react';
import { useIndexers } from 'Settings/Indexers/Indexers/useIndexers';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import EnhancedSelectInput from './EnhancedSelectInput';

export interface IndexerSelectInputProps {
  name: string;
  value: number | number[];
  includeAny?: boolean;
  onChange: (change: EnhancedSelectInputChanged<number | number[]>) => void;
}

function IndexerSelectInput({
  name,
  value,
  includeAny = false,
  onChange,
}: Readonly<IndexerSelectInputProps>) {
  const { data, isFetching } = useIndexers();

  const values = useMemo(() => {
    // The selector this replaces sorted `items` in place, which mutated the
    // slice's own array. Under React Query that array is the cached object
    // every other reader shares, so the copy is not optional -- it is the §8
    // F1 hazard.
    const sorted = [...data].sort(sortByProp('name')).map((indexer) => ({
      key: indexer.id,
      value: indexer.name,
    }));

    if (includeAny) {
      sorted.unshift({
        key: 0,
        value: `(${translate('Any')})`,
      });
    }

    return sorted;
  }, [data, includeAny]);

  return (
    <EnhancedSelectInput
      name={name}
      value={value}
      isFetching={isFetching}
      values={values}
      onChange={onChange}
    />
  );
}

export default IndexerSelectInput;
