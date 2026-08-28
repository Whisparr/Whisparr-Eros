import React from 'react';
import FilterBuilderRowValue from './FilterBuilderRowValue';
import FilterBuilderRowValueProps from './FilterBuilderRowValueProps';

const protocols = [
  { id: true, name: 'true' },
  { id: false, name: 'false' },
];

function BoolFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  return <FilterBuilderRowValue tagList={protocols} {...props} />;
}

export default BoolFilterBuilderRowValue;
