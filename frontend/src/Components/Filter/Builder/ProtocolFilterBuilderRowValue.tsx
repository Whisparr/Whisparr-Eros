import React from 'react';
import FilterBuilderRowValue from './FilterBuilderRowValue';
import FilterBuilderRowValueProps from './FilterBuilderRowValueProps';

const protocols = [
  { id: 'torrent', name: 'Torrent' },
  { id: 'usenet', name: 'Usenet' },
];

function ProtocolFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  return <FilterBuilderRowValue tagList={protocols} {...props} />;
}

export default ProtocolFilterBuilderRowValue;
