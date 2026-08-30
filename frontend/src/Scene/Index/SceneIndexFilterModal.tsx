import React, { useCallback } from 'react';
import FilterModal from 'Components/Filter/FilterModal';
import { SCENE_INDEX_FILTER_BUILDER_PROPS } from './sceneIndexFilterBuilderProps';
import { setSceneIndexFilter } from './sceneIndexOptionsStore';
import { useSceneIndex } from './useSceneIndex';

interface SceneIndexFilterModalProps {
  isOpen: boolean;
}

export default function SceneIndexFilterModal(
  props: SceneIndexFilterModalProps
) {
  // `sectionItems` is what the filter builder would draw value suggestions from.
  // It used to read `state.movies.items`, which nothing has populated since the
  // index went paged. Unlike Movie, no Scene filter row declares an
  // `optionsSelector`, and `FilterBuilderRowValueConnector` returns an empty list
  // without one -- so this is inert either way today. It is fed from the page the
  // index is already showing, off the same cached query, so it costs no extra
  // request and is real data if a Scene row ever gains a selector.
  const { items: sectionItems } = useSceneIndex();
  const customFilterType = 'sceneIndex';

  // Setting the filter resets the page, so no separate page dispatch is needed.
  const dispatchSetFilter = useCallback(
    ({ selectedFilterKey }: { selectedFilterKey: string | number }) => {
      setSceneIndexFilter(selectedFilterKey);
    },
    []
  );

  return (
    <FilterModal
      // TODO: Don't spread all the props
      {...props}
      sectionItems={sectionItems}
      filterBuilderProps={SCENE_INDEX_FILTER_BUILDER_PROPS}
      customFilterType={customFilterType}
      dispatchSetFilter={dispatchSetFilter}
    />
  );
}
