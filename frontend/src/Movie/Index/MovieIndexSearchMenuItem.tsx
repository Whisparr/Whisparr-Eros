import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSelect } from 'App/SelectContext';
import AppState from 'App/State/AppState';
import ClientSideCollectionAppState from 'App/State/ClientSideCollectionAppState';
import MoviesAppState, { MovieIndexAppState } from 'App/State/MoviesAppState';
import { MOVIE_SEARCH } from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import PageToolbarOverflowMenuItem from 'Components/Page/Toolbar/PageToolbarOverflowMenuItem';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import { icons } from 'Helpers/Props';
import createMovieClientSideCollectionItemsSelector from 'Store/Selectors/createMovieClientSideCollectionItemsSelector';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';

interface MovieIndexSearchMenuItemProps {
  isSelectMode: boolean;
  selectedFilterKey: string;
}

const selectMovieIndexItems =
  createMovieClientSideCollectionItemsSelector('movieIndex');

function MovieIndexSearchMenuItem(props: MovieIndexSearchMenuItemProps) {
  const isSearching = useCommandExecuting(MOVIE_SEARCH);
  const customFilters = useCustomFiltersList('movies', 'movieIndex');

  const {
    items,
  }: MoviesAppState & MovieIndexAppState & ClientSideCollectionAppState =
    useSelector(
      useCallback(
        (state: AppState) => selectMovieIndexItems(state, { customFilters }),
        [customFilters]
      )
    );

  const executeCommand = useExecuteCommand();

  const { isSelectMode, selectedFilterKey } = props;
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
