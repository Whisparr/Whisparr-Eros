import React from 'react';
import FilterBuilderRowValueProps from 'Components/Filter/Builder/FilterBuilderRowValueProps';
import { useImportLists } from 'Settings/ImportLists/ImportLists/useImportLists';
import sortByProp from 'Utilities/Array/sortByProp';
import FilterBuilderRowValue from './FilterBuilderRowValue';

function ImportListFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  const { data } = useImportLists();

  const tagList = data
    .map(({ id, name }) => ({ id, name }))
    .sort(sortByProp('name'));

  return <FilterBuilderRowValue {...props} tagList={tagList} />;
}

export default ImportListFilterBuilderRowValue;
