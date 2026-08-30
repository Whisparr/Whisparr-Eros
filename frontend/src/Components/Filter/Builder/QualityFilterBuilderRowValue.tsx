import React from 'react';
import FilterBuilderRowValueProps from 'Components/Filter/Builder/FilterBuilderRowValueProps';
import { useQualities } from 'Settings/Profiles/Quality/useQualityProfiles';
import FilterBuilderRowValue from './FilterBuilderRowValue';

function QualityFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  const { qualities } = useQualities();

  return <FilterBuilderRowValue {...props} tagList={qualities} />;
}

export default QualityFilterBuilderRowValue;
