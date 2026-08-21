import React, { useCallback, useMemo } from 'react';
import { useSelect } from 'App/SelectContext';
import { REFRESH_MOVIE } from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import { icons } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';

interface MovieIndexRefreshMovieButtonProps {
  isSelectMode: boolean;
  selectedFilterKey: string | number;
  items: Movie[];
}

function MovieIndexRefreshMovieButton(
  props: MovieIndexRefreshMovieButtonProps
) {
  const { items } = props;
  const isRefreshing = useCommandExecuting(REFRESH_MOVIE);

  const executeCommand = useExecuteCommand();
  const { isSelectMode, selectedFilterKey } = props;
  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const selectedMovieIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const moviesToRefresh =
    isSelectMode && selectedMovieIds.length > 0
      ? selectedMovieIds
      : items.map((m) => m.id);

  const refreshIndexLabel =
    selectedFilterKey === 'all'
      ? translate('UpdateAll')
      : translate('UpdateFiltered');

  const refreshSelectLabel =
    selectedMovieIds.length > 0
      ? translate('UpdateSelected')
      : translate('UpdateAll');

  const onPress = useCallback(() => {
    executeCommand({
      name: REFRESH_MOVIE,
      movieIds: moviesToRefresh,
    });
  }, [moviesToRefresh, executeCommand]);

  return (
    <PageToolbarButton
      label={isSelectMode ? refreshSelectLabel : refreshIndexLabel}
      isSpinning={isRefreshing}
      isDisabled={!items.length || isRefreshing}
      iconName={icons.REFRESH}
      onPress={onPress}
    />
  );
}

export default MovieIndexRefreshMovieButton;
