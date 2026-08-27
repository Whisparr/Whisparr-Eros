import { useManageSettings, useSettings } from 'Settings/useSettings';
import General from 'typings/Settings/General';

const PATH = '/config/host';

export const useGeneralSettings = () => {
  return useSettings<General>(PATH);
};

export const useManageGeneralSettings = () => {
  return useManageSettings<General>(PATH);
};
