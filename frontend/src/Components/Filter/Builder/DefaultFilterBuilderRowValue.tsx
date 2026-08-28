import { uniqBy } from 'lodash';
import React, { useMemo } from 'react';
import { FilterBuilderPropOption } from 'Filters/Filter';
import { filterBuilderTypes } from 'Helpers/Props';
import * as filterTypes from 'Helpers/Props/filterTypes';
import FilterBuilderRowValue from './FilterBuilderRowValue';
import FilterBuilderRowValueProps from './FilterBuilderRowValueProps';

interface DefaultFilterBuilderRowValueProps extends Omit<
  FilterBuilderRowValueProps,
  'sectionItem'
> {
  sectionItems: unknown[];
}

// The last `connect()` in the app, and it never read the store: its
// `mapStateToProps` was `createSelector` over three own props, so all it bought
// was memoizing a prop transformation. That is what `useMemo` is for.
function DefaultFilterBuilderRowValue({
  filterType,
  sectionItems,
  selectedFilterBuilderProp,
  ...otherProps
}: Readonly<DefaultFilterBuilderRowValueProps>) {
  const tagList = useMemo(() => {
    const { type, optionsSelector } = selectedFilterBuilderProp;

    // A number or string filter only suggests values when it is asking for an
    // exact match; greater-than and the rest take a typed value.
    const isComparison =
      (type === filterBuilderTypes.NUMBER ||
        type === filterBuilderTypes.STRING) &&
      filterType !== filterTypes.EQUAL &&
      filterType !== filterTypes.NOT_EQUAL;

    if (isComparison || !optionsSelector) {
      return [];
    }

    return uniqBy<FilterBuilderPropOption>(optionsSelector(sectionItems), 'id');
  }, [filterType, sectionItems, selectedFilterBuilderProp]);

  return (
    <FilterBuilderRowValue
      {...otherProps}
      filterType={filterType}
      selectedFilterBuilderProp={selectedFilterBuilderProp}
      tagList={tagList}
    />
  );
}

export default DefaultFilterBuilderRowValue;
