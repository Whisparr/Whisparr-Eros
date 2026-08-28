import React, { useCallback } from 'react';
import FilterModal, {
  FilterModalPassthroughProps,
} from 'Components/Filter/FilterModal';
import { MOVIE_INDEX_FILTER_BUILDER_PROPS } from './movieIndexFilterBuilderProps';
import { setMovieIndexFilter } from './movieIndexOptionsStore';
import { useMovieIndex } from './useMovieIndex';

type MovieIndexFilterModalProps = FilterModalPassthroughProps;

export default function MovieIndexFilterModal(
  props: MovieIndexFilterModalProps
) {
  // `sectionItems` feeds the filter builder's value suggestions. It used to read
  // `state.movies.items`, which nothing has populated since the index went paged,
  // so the suggestions were always empty. `useMovieIndex` returns the page the
  // index is already showing off the same cached query -- fewer values than
  // Sonarr's whole-library list, but real ones.
  const { items: sectionItems } = useMovieIndex();
  const customFilterType = 'movieIndex';

  // Setting the filter resets the page, so no separate page dispatch is needed.
  const dispatchSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setMovieIndexFilter(selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...props}
      sectionItems={sectionItems}
      filterBuilderProps={MOVIE_INDEX_FILTER_BUILDER_PROPS}
      customFilterType={customFilterType}
      dispatchSetFilter={dispatchSetFilter}
    />
  );
}
