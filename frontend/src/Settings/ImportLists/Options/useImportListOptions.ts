import { useManageSettings, useSettings } from 'Settings/useSettings';
import ImportListOptions from 'typings/Settings/ImportListOptions';

const PATH = '/config/importlist';

export const useImportListOptions = () => {
  return useSettings<ImportListOptions>(PATH);
};

export const useManageImportListOptions = () => {
  return useManageSettings<ImportListOptions>(PATH);
};
