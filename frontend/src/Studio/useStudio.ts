import { useMutation } from '@tanstack/react-query';
import { queryClient } from 'App/queryClient';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import Studio from './Studio';

const AUTH_HEADERS = {
  'X-Api-Key': globalThis.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};

export function useStudio(foreignId: string | undefined) {
  return useApiQuery<Studio>({
    path: `/studio/${foreignId}`,
    queryOptions: { enabled: !!foreignId },
  });
}

export function useToggleStudioMonitored() {
  return useMutation({
    mutationFn: async ({
      studioId,
      foreignId,
      monitored,
      moviesMonitored,
    }: {
      studioId: number;
      foreignId: string;
      monitored: boolean;
      moviesMonitored: boolean;
    }) => {
      const studioPath = `/studio/${foreignId}`;
      // Fetch from cache first; falls back to network if not cached
      const studio = await queryClient.fetchQuery<Studio>({
        queryKey: [studioPath],
        queryFn: () =>
          fetchJson<Studio, undefined>({
            path: getQueryPath(studioPath),
            headers: AUTH_HEADERS,
          }),
      });
      return fetchJson<Studio, Studio>({
        path: getQueryPath(`/studio/${studioId}`),
        method: 'PUT',
        body: { ...studio, monitored, moviesMonitored },
        headers: AUTH_HEADERS,
      });
    },
    onSuccess: (data) => {
      if (data?.foreignId) {
        queryClient.setQueryData(
          [`/studio/${data.foreignId}`],
          (old: Studio) => (old ? { ...old, ...data } : data)
        );
      }
    },
  });
}

export default useStudio;
