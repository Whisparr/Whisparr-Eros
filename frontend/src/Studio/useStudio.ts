import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import Studio from './Studio';

export function useStudio(foreignId: string | undefined) {
  return useApiQuery<Studio>({
    path: `/studio/${foreignId}`,
    queryOptions: { enabled: !!foreignId },
  });
}

export function useSaveStudio() {
  return useApiMutation<Studio, Studio>({
    method: 'PUT',
    path: ({ id }) => `/studio/${id}`,
    mutationOptions: {
      onSuccess: (data) => {
        queryClient.setQueryData([`/studio/${data.foreignId}`], data);
        queryClient.invalidateQueries({ queryKey: ['/studio/paged'] });
      },
    },
  });
}

interface ToggleStudioInput {
  studioId: number;
  foreignId: string;
  monitored: boolean;
  moviesMonitored: boolean;
}

// `PUT /studio/{id}` takes the whole studio, but callers only hold the two
// monitored fields -- read-modify-write against the cached entity. The cache
// is cold when `useStudio` was never mounted for this foreign id (movie credit
// posters), so fall back to a plain read over the same path it would take.
export function useToggleStudioMonitored() {
  return useApiMutation<Studio, ToggleStudioInput, Studio>({
    method: 'PUT',
    path: ({ studioId }) => `/studio/${studioId}`,
    body: async ({ foreignId, monitored, moviesMonitored }) => {
      const studioPath = `/studio/${foreignId}`;
      // Fetch from cache first; falls back to network if not cached
      const studio = await queryClient.fetchQuery<Studio>({
        queryKey: [studioPath],
        queryFn: () =>
          fetchJson<Studio, undefined>({
            path: getQueryPath(studioPath),
            headers: {
              'X-Api-Key': window.Whisparr.apiKey,
              'X-Whisparr-Client': 'Whisparr',
            },
          }),
      });
      return { ...studio, monitored, moviesMonitored };
    },
    mutationOptions: {
      onSuccess: (data) => {
        if (data?.foreignId) {
          queryClient.setQueryData(
            [`/studio/${data.foreignId}`],
            (old: Studio) => (old ? { ...old, ...data } : data)
          );
        }
      },
    },
  });
}

export default useStudio;
