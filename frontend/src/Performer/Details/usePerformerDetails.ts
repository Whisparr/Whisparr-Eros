import { useEffect, useRef, useState } from 'react';
import { queryClient } from 'App/queryClient';
import * as commandNames from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Movie from 'Movie/Movie';
import Performer from 'Performer/Performer';
import { useTogglePerformerMonitored } from 'Performer/usePerformer';

const PATH = 'performer';

export const usePerformerDetails = (foreignId: string) => {
  const executeCommand = useExecuteCommand();
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const prevPerformerRef = useRef<Performer | undefined>(undefined);

  const {
    data: performer,
    error: performerDetailsError,
    isFetching: performerDetailsLoading,
  } = useApiQuery<Performer>({
    path: `/${PATH}/${foreignId}`,
  });

  useEffect(() => {
    if (performer?.id) {
      queryClient.setQueryData([`/${PATH}/${performer.id}`], performer);
    }
  }, [performer, foreignId]);

  const performerId = performer?.id;

  const monitorToggleMutation = useTogglePerformerMonitored();

  // TODO: Move to useApiQuery
  function onRefreshPress() {
    if (!performerId) return;
    setIsManualRefresh(true);
    executeCommand({
      name: commandNames.REFRESH_PERFORMER,
      performerIds: [performerId],
    });
  }

  // TODO: Move to useApiQuery
  function onYearRefreshPress(ids: number[]) {
    if (!performerId) return;
    setIsManualRefresh(true);
    executeCommand({
      name: commandNames.REFRESH_MOVIE,
      movieIds: ids,
    });
  }

  // When performer data changes, clear manual refresh
  useEffect(() => {
    if (
      isManualRefresh &&
      performer &&
      prevPerformerRef.current !== performer
    ) {
      setIsManualRefresh(false);
    }
    prevPerformerRef.current = performer;
  }, [performer, isManualRefresh]);

  // TODO: Move to useApiQuery
  function onSearchPress() {
    if (!performerId) return;
    executeCommand({
      name: commandNames.PERFORMER_SEARCH,
      performerIds: [performerId],
    });
  }

  function onMonitorTogglePress(args: {
    monitored: boolean;
    moviesMonitored: boolean;
  }) {
    if (!performer || !performerId)
      throw new Error('Performer data not loaded');
    monitorToggleMutation.mutate({
      performerId,
      foreignId: performer.foreignId,
      monitored: args.monitored,
      moviesMonitored: args.moviesMonitored,
    });
  }

  // TODO: Move to useApiQuery
  function searchMoviesByIds(movieIds: number[]) {
    if (!movieIds || movieIds.length === 0) return;
    for (const id of movieIds) {
      executeCommand({
        name: commandNames.MOVIE_SEARCH,
        movieIds: [id],
      });
    }
  }

  return {
    performer,
    performerId,
    isPerformerDetailsFetching:
      performerDetailsLoading ||
      monitorToggleMutation.isPending ||
      isManualRefresh,
    isManualRefresh,
    performerDetailsError: performerDetailsError || monitorToggleMutation.error,
    onRefreshPress,
    onYearRefreshPress,
    onSearchPress,
    onMonitorTogglePress,
    searchMoviesByIds,
  };
};

export function usePerformerDetailsMovies(performerForeignId: string) {
  return useApiQuery<Movie[]>({
    path: `/${PATH}/${performerForeignId}/works`,
  });
}
