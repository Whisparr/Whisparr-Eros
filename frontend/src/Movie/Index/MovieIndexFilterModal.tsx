import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import FilterModal from 'Components/Filter/FilterModal';
import { MOVIE_INDEX_FILTER_BUILDER_PROPS } from './movieIndexFilterBuilderProps';
import { setMovieIndexFilter } from './movieIndexOptionsStore';

// `sectionItems` still comes from the movies slice; it converts with
// `movieActions` rather than with the index view options.
function createMovieSelector() {
  return createSelector(
    (state: AppState) => state.movies.items,
    (movies) => {
      return movies;
    }
  );
}

interface MovieIndexFilterModalProps {
  isOpen: boolean;
}

export default function MovieIndexFilterModal(
  props: MovieIndexFilterModalProps
) {
  const sectionItems = useSelector(createMovieSelector());
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
