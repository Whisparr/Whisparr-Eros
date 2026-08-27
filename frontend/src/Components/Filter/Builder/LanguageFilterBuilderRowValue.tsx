import React from 'react';
import { useFilteredLanguages } from 'Language/useLanguages';
import FilterBuilderRowValue from './FilterBuilderRowValue';
import FilterBuilderRowValueProps from './FilterBuilderRowValueProps';

// `Any` is the wildcard the release parser reports, not something a file is
// tagged with, so it was never offered as a filter value.
const EXCLUDED_LANGUAGES = ['Any'];

function LanguageFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  const { data: items } = useFilteredLanguages(EXCLUDED_LANGUAGES);

  return <FilterBuilderRowValue {...props} tagList={items} />;
}

export default LanguageFilterBuilderRowValue;
