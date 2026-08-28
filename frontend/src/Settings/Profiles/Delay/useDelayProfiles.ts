import { useCallback } from 'react';
import ModelBase from 'App/ModelBase';
import DownloadProtocol from 'DownloadClient/DownloadProtocol';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';

export interface DelayProfile extends ModelBase {
  enableUsenet: boolean;
  enableTorrent: boolean;
  preferredProtocol: DownloadProtocol;
  usenetDelay: number;
  torrentDelay: number;
  bypassIfHighestQuality: boolean;
  bypassIfAboveCustomFormatScore: boolean;
  minimumCustomFormatScore: number;
  order: number;
  tags: number[];
}

const PATH = '/delayprofile';

// Profile 1 is the one the server seeds and refuses to delete: it takes no
// tags, it is not part of the ordering, and the page renders it under the
// list rather than in it.
export const DEFAULT_DELAY_PROFILE_ID = 1;

const NEW_DELAY_PROFILE: DelayProfile = {
  id: 0,
  enableUsenet: true,
  enableTorrent: true,
  preferredProtocol: 'usenet',
  usenetDelay: 0,
  torrentDelay: 0,
  bypassIfHighestQuality: false,
  bypassIfAboveCustomFormatScore: false,
  minimumCustomFormatScore: 0,
  // Whatever goes up, `DelayProfileService.Add` overwrites `order` with the
  // profile count, so a new profile always lands at the end of the list.
  order: 0,
  tags: [],
};

export const useDelayProfiles = () => {
  return useProviderSettings<DelayProfile>(PATH);
};

export const useDelayProfilesWithIds = (ids: number[]) => {
  const { data } = useDelayProfiles();

  return data.filter((delayProfile) => ids.includes(delayProfile.id));
};

export const useManageDelayProfile = (id: number) => {
  return useManageProviderSettings<DelayProfile>(id, NEW_DELAY_PROFILE, PATH);
};

export const useDeleteDelayProfile = (id: number) => {
  const result = useDeleteProvider<DelayProfile>(id, PATH);

  return {
    ...result,
    deleteDelayProfile: result.deleteProvider,
  };
};

interface ReorderDelayProfile {
  id: number;
  after?: number;
}

export const useReorderDelayProfile = () => {
  const queryClient = useQueryClient();
  const { data } = useDelayProfiles();

  // The endpoint takes the profile in the route and the one it lands after in
  // the query string and reads nothing from the body, so these variables only
  // build the request. It answers with the whole reordered list, which makes
  // the response the cache rather than a reason to refetch.
  const { mutate } = useApiMutation<DelayProfile[], ReorderDelayProfile>({
    path: ({ id }) => `${PATH}/reorder/${id}`,
    method: 'PUT',
    queryParams: ({ after }) => (after === undefined ? {} : { after }),
    mutationOptions: {
      onSuccess: (delayProfiles: DelayProfile[]) => {
        queryClient.setQueryData<DelayProfile[]>([PATH], delayProfiles);
      },
    },
  });

  return useCallback(
    (id: number, moveIndex: number) => {
      const moving = data.find((delayProfile) => delayProfile.id === id);

      // Orders are 1-based and the drop index is not, so a profile dropped
      // where it already sits is a no-op rather than a request.
      if (!moving || moving.order === moveIndex + 1) {
        return;
      }

      const after =
        moveIndex > 0
          ? data.find((delayProfile) => delayProfile.order === moveIndex)
          : undefined;

      mutate({ id, after: after?.id });
    },
    [data, mutate]
  );
};
