import React, { useCallback, useMemo } from 'react';
import { useSelect } from 'App/SelectContext';
import { MOVIE_SEARCH } from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import PageToolbarOverflowMenuItem from 'Components/Page/Toolbar/PageToolbarOverflowMenuItem';
import { icons } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';

// The overflow twin of `MovieIndexSearchButton`. `PageToolbarSection` renders it
// with the button's own props, so `items` is the page the index is showing --
// the same list the button searches. It used to run its own client-side
// collection selector over the `movies` slice instead, which nothing has
// populated since the index went paged, so the menu item was always disabled.
interface MovieIndexSearchMenuItemProps {
  isSelectMode: boolean;
  selectedFilterKey: string | number;
  items: Movie[];
}

function MovieIndexSearchMenuItem(
  props: Readonly<MovieIndexSearchMenuItemProps>
) {
  const { isSelectMode, selectedFilterKey, items } = props;

  const isSearching = useCommandExecuting(MOVIE_SEARCH);
  const executeCommand = useExecuteCommand();

  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const selectedMovieIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const moviesToSearch =
    isSelectMode && selectedMovieIds.length > 0
      ? selectedMovieIds
      : items.map((m) => m.id);

  const searchIndexLabel =
    selectedFilterKey === 'all'
      ? translate('SearchAll')
      : translate('SearchFiltered');

  const searchSelectLabel =
    selectedMovieIds.length > 0
      ? translate('SearchSelected')
      : translate('SearchAll');

  const onPress = useCallback(() => {
    executeCommand({
      name: MOVIE_SEARCH,
      movieIds: moviesToSearch,
    });
  }, [moviesToSearch, executeCommand]);

  return (
    <PageToolbarOverflowMenuItem
      label={isSelectMode ? searchSelectLabel : searchIndexLabel}
      isSpinning={isSearching}
      isDisabled={!items.length}
      iconName={icons.SEARCH}
      onPress={onPress}
    />
  );
}

export default MovieIndexSearchMenuItem;
