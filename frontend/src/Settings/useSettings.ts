import { useCallback, useMemo } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { usePendingChangesStore } from 'Helpers/Hooks/usePendingChangesStore';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import selectSettings from 'Helpers/selectSettings';

// One shared object for the not-yet-fetched case. Sonarr's copy builds a fresh
// `{}` on every render, which is a new identity for anything that puts the
// settings in a dependency array; the settings never change identity here.
const NO_SETTINGS = {};

export const useSettings = <T extends object>(path: string) => {
  const result = useApiQuery<T>({
    path,
  });

  return {
    ...result,
    data: result.data ?? (NO_SETTINGS as T),
  };
};

export const useSaveSettings = <T extends object>(
  path: string,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<T, T>({
    path,
    method: 'PUT',
    mutationOptions: {
      onSuccess: (updatedSettings: T) => {
        queryClient.setQueryData<T>([path], updatedSettings);
        onSuccess?.();
      },
    },
  });

  return {
    save: mutate,
    isSaving: isPending,
    saveError: error,
  };
};

export const useManageSettings = <T extends object>(path: string) => {
  const { data, isFetching, isFetched, error } = useSettings<T>(path);
  const {
    pendingChanges,
    setPendingChange,
    unsetPendingChange,
    clearPendingChanges,
  } = usePendingChangesStore<T>({});

  const { save, isSaving, saveError } = useSaveSettings<T>(
    path,
    clearPendingChanges
  );

  const settings = useMemo(() => {
    return selectSettings<T>(data, pendingChanges, saveError);
  }, [data, pendingChanges, saveError]);

  const saveSettings = useCallback(() => {
    save({
      ...data,
      ...pendingChanges,
    });
  }, [data, pendingChanges, save]);

  // `createSetSettingValueReducer` decided here whether an edit was a change at
  // all, comparing against the slice's copy of the value and coercing through
  // `Number.parseInt` first. The store does not hold the saved value, so the
  // comparison lives with the caller now -- and the coercion does not come with
  // it, because the query data is typed rather than being whatever the last
  // reducer wrote.
  const updateSetting = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      if (data[key] === value) {
        unsetPendingChange(key);
      } else {
        setPendingChange(key, value);
      }
    },
    [data, setPendingChange, unsetPendingChange]
  );

  return {
    ...settings,
    updateSetting,
    saveSettings,
    isFetching,
    isFetched,
    isSaving,
    error,
    saveError,
  };
};
