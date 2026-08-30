import { useManageSettings, useSettings } from 'Settings/useSettings';
import MediaManagement from 'typings/Settings/MediaManagement';

// Sonarr's copy reads `/settings/mediamanagement`; that route is API v5, and
// Eros is on v3.
const PATH = '/config/mediamanagement';

export const useMediaManagementSettings = () => {
  return useSettings<MediaManagement>(PATH);
};

export const useManageMediaManagementSettings = () => {
  return useManageSettings<MediaManagement>(PATH);
};
