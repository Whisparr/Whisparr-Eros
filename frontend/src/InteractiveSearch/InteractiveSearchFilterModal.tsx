import React, { useCallback } from 'react';
import FilterModal from 'Components/Filter/FilterModal';
import InteractiveSearchPayload from './InteractiveSearchPayload';
import { RELEASE_FILTER_BUILDER_PROPS } from './releaseFilters';
import { setReleasesFilter } from './releaseOptionsStore';
import { useReleases } from './useReleases';

interface InteractiveSearchFilterModalProps {
  isOpen: boolean;
  searchPayload: InteractiveSearchPayload;
}

export default function InteractiveSearchFilterModal({
  searchPayload,
  ...otherProps
}: InteractiveSearchFilterModalProps) {
  // Same query key as the table behind it, so the builder's value suggestions
  // come from the releases already on screen rather than a second search.
  const { releases } = useReleases(searchPayload);

  const dispatchSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setReleasesFilter(selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...otherProps}
      sectionItems={releases}
      filterBuilderProps={RELEASE_FILTER_BUILDER_PROPS}
      customFilterType="releases"
      dispatchSetFilter={dispatchSetFilter}
    />
  );
}
