import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import * as commandNames from 'Commands/commandNames';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Movie from 'Movie/Movie';
import Performer from 'Performer/Performer';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchGeneralSettings } from 'Store/Actions/Settings/general';

const PATH = 'performer';

export const usePerformerDetails = (foreignId: string) => {
  const dispatch = useDispatch();
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const prevPerformerRef = useRef<Performer | undefined>();

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

  // Mutation for toggling monitored state
  // This mutation will update the performer and then update the cache for the performer details
  const monitorToggleMutation = useApiMutation<Performer, Performer>({
    method: 'PUT',
    path: performerId ? `/${PATH}/${performerId}` : '',
    mutationOptions: {
      onSuccess: (data) => {
        if (data?.foreignId) {
          queryClient.setQueryData(
            [`/${PATH}/${data.foreignId}`],
            (oldData: Performer) => {
              if (!oldData || typeof oldData !== 'object') {
                return data;
              }
              return { ...oldData, ...data };
            }
          );
        }
      },
    },
  });

  // TODO: Move to useApiQuery
  function onRefreshPress() {
    if (!performerId) return;
    setIsManualRefresh(true);
    dispatch(
      executeCommand({
        name: commandNames.REFRESH_PERFORMER,
        performerIds: [performerId],
      })
    );
  }

  // TODO: Move to useApiQuery
  function onYearRefreshPress(ids: number[]) {
    if (!performerId) return;
    setIsManualRefresh(true);
    dispatch(
      executeCommand({
        name: commandNames.REFRESH_MOVIE,
        movieIds: ids,
      })
    );
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
    dispatch(
      executeCommand({
        name: commandNames.PERFORMER_SEARCH,
        performerIds: [performerId],
      })
    );
  }

  function onMonitorTogglePress(args: {
    monitored: boolean;
    moviesMonitored: boolean;
  }) {
    if (!performer || !performerId)
      throw new Error('Performer data not loaded');
    // Clone the performer object and update monitored fields
    const updatedPerformer = {
      ...performer,
      monitored: args.monitored,
      moviesMonitored: args.moviesMonitored,
    };
    monitorToggleMutation.mutate(updatedPerformer);
  }

  // TODO: Move to useApiQuery
  function searchMoviesByIds(movieIds: number[]) {
    if (!movieIds || movieIds.length === 0) return;
    for (const id of movieIds) {
      dispatch(
        executeCommand({
          name: commandNames.MOVIE_SEARCH,
          movieIds: [id],
        })
      );
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
    performerDetailsError:
      performerDetailsError ||
      performerDetailsError ||
      monitorToggleMutation.error,
    onRefreshPress,
    onYearRefreshPress,
    onSearchPress,
    onMonitorTogglePress,
    searchMoviesByIds,
  };
};

// Used to fetch general.whisparrMovieMetadataSource setting
export function useGeneralSettings() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGeneralSettings());
  }, [dispatch]);

  return useSelector((state: AppState) => state.settings.general.item);
}

export function usePerformerDetailsMovies(performerForeignId: string) {
  return useApiQuery<Movie[]>({
    path: `/${PATH}/${performerForeignId}/works`,
  });
}

export function usePerformerScenesColumns() {
  return useSelector((state: AppState) => {
    // AppState isn't fully converted to TypeScript yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const performerScenes = (state as any).performerScenes;
    return {
      columns: performerScenes?.columns ?? [],
      sortKey: performerScenes?.sortKey ?? 'releaseDate',
      sortDirection: performerScenes?.sortDirection ?? 'DESC',
    };
  });
}
