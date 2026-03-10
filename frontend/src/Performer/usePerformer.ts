import { useMutation } from '@tanstack/react-query';
import { queryClient } from 'App/queryClient';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import Performer from './Performer';

const AUTH_HEADERS = {
  'X-Api-Key': globalThis.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};

export function usePerformer(foreignId: string | undefined) {
  return useApiQuery<Performer>({
    path: `/performer/${foreignId}`,
    queryOptions: { enabled: !!foreignId },
  });
}

export function useTogglePerformerMonitored() {
  return useMutation({
    mutationFn: async ({
      performerId,
      foreignId,
      monitored,
      moviesMonitored,
    }: {
      performerId: number;
      foreignId: string;
      monitored: boolean;
      moviesMonitored: boolean;
    }) => {
      const performerPath = `/performer/${foreignId}`;
      // Fetch from cache first; falls back to network if not cached
      const performer = await queryClient.fetchQuery<Performer>({
        queryKey: [performerPath],
        queryFn: () =>
          fetchJson<Performer, undefined>({
            path: getQueryPath(performerPath),
            headers: AUTH_HEADERS,
          }),
      });
      return fetchJson<Performer, Performer>({
        path: getQueryPath(`/performer/${performerId}`),
        method: 'PUT',
        body: { ...performer, monitored, moviesMonitored },
        headers: AUTH_HEADERS,
      });
    },
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
  });
}

export default usePerformer;
