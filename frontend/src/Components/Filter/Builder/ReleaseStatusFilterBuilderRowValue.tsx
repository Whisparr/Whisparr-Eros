import React from 'react';
import translate from 'Utilities/String/translate';
import FilterBuilderRowValue from './FilterBuilderRowValue';
import FilterBuilderRowValueProps from './FilterBuilderRowValueProps';

const statusTagList = [
  {
    id: 'tba',
    get name() {
      return translate('Tba');
    },
  },
  {
    id: 'announced',
    get name() {
      return translate('Announced');
    },
  },
  {
    id: 'released',
    get name() {
      return translate('Released');
    },
  },
  {
    id: 'deleted',
    get name() {
      return translate('Deleted');
    },
  },
];

function ReleaseStatusFilterBuilderRowValue(
  props: Readonly<FilterBuilderRowValueProps>
) {
  return <FilterBuilderRowValue tagList={statusTagList} {...props} />;
}

export default ReleaseStatusFilterBuilderRowValue;
