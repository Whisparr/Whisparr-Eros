import { useManageSettings, useSettings } from 'Settings/useSettings';
import IndexerOptions from 'typings/Settings/IndexerOptions';

const PATH = '/config/indexer';

export const useIndexerOptions = () => {
  return useSettings<IndexerOptions>(PATH);
};

export const useManageIndexerOptions = () => {
  return useManageSettings<IndexerOptions>(PATH);
};
