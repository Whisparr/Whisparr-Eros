import React, { useCallback } from 'react';
import FilterModal, {
  FilterModalPassthroughProps,
} from 'Components/Filter/FilterModal';
import { COLLECTION_FILTER_BUILDER_PROPS } from './collectionFilters';
import { setCollectionFilter } from './collectionOptionsStore';
import { useMovieCollections } from './useMovieCollections';

type MovieCollectionFilterModalProps = FilterModalPassthroughProps;

export default function MovieCollectionFilterModal(
  props: MovieCollectionFilterModalProps
) {
  const { collections } = useMovieCollections();

  const dispatchSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setCollectionFilter(selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...props}
      sectionItems={collections}
      filterBuilderProps={COLLECTION_FILTER_BUILDER_PROPS}
      customFilterType="movieCollections"
      dispatchSetFilter={dispatchSetFilter}
    />
  );
}
