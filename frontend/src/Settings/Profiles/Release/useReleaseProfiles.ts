import ModelBase from 'App/ModelBase';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';

export interface ReleaseProfile extends ModelBase {
  name: string;
  enabled: boolean;
  required: string[];
  ignored: string[];
  indexerIds: number[];
  tags: number[];
}

const PATH = '/releaseprofile';

const NEW_RELEASE_PROFILE: ReleaseProfile = {
  id: 0,
  name: '',
  enabled: true,
  required: [],
  ignored: [],
  indexerIds: [],
  tags: [],
};

export const useReleaseProfiles = () => {
  return useProviderSettings<ReleaseProfile>(PATH);
};

export const useReleaseProfilesWithIds = (ids: number[]) => {
  const { data } = useReleaseProfiles();

  return data.filter((releaseProfile) => ids.includes(releaseProfile.id));
};

export const useManageReleaseProfile = (id: number) => {
  return useManageProviderSettings<ReleaseProfile>(
    id,
    NEW_RELEASE_PROFILE,
    PATH
  );
};

export const useDeleteReleaseProfile = (id: number) => {
  const result = useDeleteProvider<ReleaseProfile>(id, PATH);

  return {
    ...result,
    deleteReleaseProfile: result.deleteProvider,
  };
};
