import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import Performer, { PerformerVisibility } from 'Performer/Performer';

interface PerformerEditorPayload {
  performerIds: number[];
  monitored?: boolean;
  moviesMonitored?: boolean;
  whisparrMonitorNewItems?: boolean;
  visibility?: PerformerVisibility;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
  afterDate?: string;
  tags?: number[];
  applyTags?: 'add' | 'remove' | 'replace';
}

export function useEditPerformersMutation() {
  const mutation = useApiMutation<Performer[], PerformerEditorPayload>({
    method: 'PUT',
    path: '/performer/editor',
    mutationOptions: {
      onSuccess: () => {
        // Invalidate all performer paged queries regardless of paging/sorting/filter params
        queryClient.invalidateQueries({
          queryKey: ['/performer/paged'],
        });
        queryClient.invalidateQueries({
          queryKey: ['/performer/visible'],
        });
      },
    },
  });

  return mutation;
}
