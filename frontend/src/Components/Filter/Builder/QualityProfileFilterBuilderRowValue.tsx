import React from 'react';
import FilterBuilderRowValueProps from 'Components/Filter/Builder/FilterBuilderRowValueProps';
import { useQualityProfiles } from 'Settings/Profiles/Quality/useQualityProfiles';
import sortByProp from 'Utilities/Array/sortByProp';
import FilterBuilderRowValue from './FilterBuilderRowValue';

function QualityProfileFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  const { data } = useQualityProfiles();

  const tagList = data
    .map(({ id, name }) => ({ id, name }))
    .sort(sortByProp('name'));

  return <FilterBuilderRowValue {...props} tagList={tagList} />;
}

export default QualityProfileFilterBuilderRowValue;
