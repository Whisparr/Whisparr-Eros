import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import Studio from 'Studio/Studio';

interface StudioEditorPayload {
  studioIds: number[];
  monitored?: boolean;
  moviesMonitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
  afterDate?: string;
  tags?: number[];
  applyTags?: 'add' | 'remove' | 'replace';
}

export function useEditStudiosModalMutation() {
  return useApiMutation<Studio[], StudioEditorPayload>({
    method: 'PUT',
    path: '/studio/editor',
    mutationOptions: {
      onSuccess: () => {
        // Invalidate every studio paged query regardless of its paging, sort
        // or filter params.
        queryClient.invalidateQueries({ queryKey: ['/studio/paged'] });
      },
    },
  });
}
