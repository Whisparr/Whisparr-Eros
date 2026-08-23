import ModelBase from 'App/ModelBase';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';

export interface RemotePathMapping extends ModelBase {
  host: string;
  remotePath: string;
  localPath: string;
}

const PATH = '/remotepathmapping';

const NEW_REMOTE_PATH_MAPPING: RemotePathMapping = {
  id: 0,
  host: '',
  remotePath: '',
  localPath: '',
};

export const useRemotePathMappings = () => {
  return useProviderSettings<RemotePathMapping>(PATH);
};

export const useManageRemotePathMapping = (id: number) => {
  return useManageProviderSettings<RemotePathMapping>(
    id,
    NEW_REMOTE_PATH_MAPPING,
    PATH
  );
};

export const useDeleteRemotePathMapping = (id: number) => {
  const result = useDeleteProvider<RemotePathMapping>(id, PATH);

  return {
    ...result,
    deleteRemotePathMapping: result.deleteProvider,
  };
};
