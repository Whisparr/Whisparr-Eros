import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import Performer from './Performer';

export function usePerformer(foreignId: string | undefined) {
  return useApiQuery<Performer>({
    path: `/performer/${foreignId}`,
    queryOptions: { enabled: !!foreignId },
  });
}

// Deliberately invalidates nothing. `SignalRListener` already patches
// `/performer/{foreignId}` and invalidates the paged lists when the server
// broadcasts the update, so a second refetch here would be redundant.
export function useSavePerformer() {
  return useApiMutation<Performer, Performer>({
    method: 'PUT',
    path: ({ id }) => `/performer/${id}`,
  });
}

interface TogglePerformerInput {
  performerId: number;
  foreignId: string;
  monitored: boolean;
  moviesMonitored: boolean;
}

// `PUT /performer/{id}` takes the whole performer, but callers only hold the two
// monitored fields -- read-modify-write against the cached entity. The cache is
// cold when `usePerformer` was never mounted for this foreign id (movie credit
// posters), so fall back to a plain read over the same path it would take.
export function useTogglePerformerMonitored() {
  return useApiMutation<Performer, TogglePerformerInput, Performer>({
    method: 'PUT',
    path: ({ performerId }) => `/performer/${performerId}`,
    body: async ({ foreignId, monitored, moviesMonitored }) => {
      const performerPath = `/performer/${foreignId}`;
      // Fetch from cache first; falls back to network if not cached
      const performer = await queryClient.fetchQuery<Performer>({
        queryKey: [performerPath],
        queryFn: () =>
          fetchJson<Performer, undefined>({
            path: getQueryPath(performerPath),
            headers: {
              'X-Api-Key': window.Whisparr.apiKey,
              'X-Whisparr-Client': 'Whisparr',
            },
          }),
      });
      return { ...performer, monitored, moviesMonitored };
    },
    mutationOptions: {
      onSuccess: (data) => {
        if (data?.foreignId) {
          queryClient.setQueryData(
            [`/performer/${data.foreignId}`],
            (old: Performer) => (old ? { ...old, ...data } : data)
          );

          // Invalidate credit to handle the toggle on MovieDetails posters
          queryClient.invalidateQueries({ queryKey: ['/credit'] });
        }
      },
    },
  });
}

export default usePerformer;
