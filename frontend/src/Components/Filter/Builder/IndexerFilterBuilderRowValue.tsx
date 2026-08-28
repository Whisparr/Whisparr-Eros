import React from 'react';
import FilterBuilderRowValueProps from 'Components/Filter/Builder/FilterBuilderRowValueProps';
import { useIndexers } from 'Settings/Indexers/Indexers/useIndexers';
import sortByProp from 'Utilities/Array/sortByProp';
import FilterBuilderRowValue from './FilterBuilderRowValue';

function IndexerFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  const { data } = useIndexers();

  const tagList = data
    .map(({ id, name }) => ({ id, name }))
    .sort(sortByProp('name'));

  return <FilterBuilderRowValue {...props} tagList={tagList} />;
}

export default IndexerFilterBuilderRowValue;
