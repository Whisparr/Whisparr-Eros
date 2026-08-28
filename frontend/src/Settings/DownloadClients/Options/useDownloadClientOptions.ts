import { useManageSettings, useSettings } from 'Settings/useSettings';
import DownloadClientOptions from 'typings/Settings/DownloadClientOptions';

const PATH = '/config/downloadclient';

export const useDownloadClientOptions = () => {
  return useSettings<DownloadClientOptions>(PATH);
};

export const useManageDownloadClientOptions = () => {
  return useManageSettings<DownloadClientOptions>(PATH);
};
