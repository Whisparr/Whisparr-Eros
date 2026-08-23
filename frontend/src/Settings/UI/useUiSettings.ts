import { useCallback } from 'react';
import {
  useManageSettings,
  useSaveSettings,
  useSettings,
} from 'Settings/useSettings';
import UiSettings from 'typings/Settings/UiSettings';

// Sonarr's copy reads `/settings/ui`; that route is API v5, and Eros is on v3.
const PATH = '/config/ui';

export const useUiSettingsValues = () => {
  const { data } = useSettings<UiSettings>(PATH);

  return data;
};

export const useUiSettings = () => {
  return useSettings<UiSettings>(PATH);
};

export const useManageUiSettings = () => {
  return useManageSettings<UiSettings>(PATH);
};

// The calendar options modal writes single settings straight through without a
// pending bag, which is what `saveUISettings({ [name]: value })` did: the thunk
// merged the payload over the whole item before the PUT, because `/config/ui`
// replaces the resource rather than patching it.
export const useSaveUiSettings = () => {
  const { data } = useSettings<UiSettings>(PATH);
  const { save } = useSaveSettings<UiSettings>(PATH);

  return useCallback(
    (changes: Partial<UiSettings>) => {
      save({ ...data, ...changes });
    },
    [data, save]
  );
};
