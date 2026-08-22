import React, { useCallback } from 'react';
import FilterModal from 'Components/Filter/FilterModal';
import { COLLECTION_FILTER_BUILDER_PROPS } from './collectionFilters';
import { setCollectionFilter } from './collectionOptionsStore';
import { useMovieCollections } from './useMovieCollections';

interface MovieCollectionFilterModalProps {
  isOpen: boolean;
}

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
