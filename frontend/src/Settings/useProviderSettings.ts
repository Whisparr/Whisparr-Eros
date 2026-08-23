import { useCallback, useMemo } from 'react';
import ModelBase from 'App/ModelBase';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { usePendingChangesStore } from 'Helpers/Hooks/usePendingChangesStore';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import selectSettings from 'Store/Selectors/selectSettings';

// One shared array for the not-yet-fetched case, for the same reason
// `useSettings` keeps one shared object: a fresh `[]` per render is a new
// identity for anything that puts the list in a dependency array.
const NO_PROVIDERS: readonly never[] = [];

export const useProviderSettings = <T extends ModelBase>(path: string) => {
  const result = useApiQuery<T[]>({
    path,
  });

  return {
    ...result,
    data: result.data ?? (NO_PROVIDERS as Readonly<T[]>),
  };
};

export const useProvider = <T extends ModelBase>(
  id: number,
  defaultProvider: T,
  path: string
) => {
  const { data } = useProviderSettings<T>(path);

  return useMemo(() => {
    if (id === 0) {
      return defaultProvider;
    }

    const provider = data.find((p) => p.id === id);

    if (!provider) {
      // Every caller renders inside a Modal, which has its own error boundary,
      // so this shows the modal's error rather than blanking the page. The
      // alternative -- falling back to the default -- turns a stale edit into a
      // silent POST of a duplicate provider.
      throw new Error(`Provider with ID ${id} not found`);
    }

    return provider;
  }, [data, defaultProvider, id]);
};

export const useSaveProviderSettings = <T extends ModelBase>(
  id: number,
  path: string,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<T, T>({
    path: id === 0 ? path : `${path}/${id}`,
    method: id === 0 ? 'POST' : 'PUT',
    mutationOptions: {
      onSuccess: (updatedProvider: T) => {
        queryClient.setQueryData<T[]>([path], (providers = []) => {
          return id === 0
            ? [...providers, updatedProvider]
            : providers.map((provider) =>
                provider.id === updatedProvider.id ? updatedProvider : provider
              );
        });

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

export const useManageProviderSettings = <T extends ModelBase>(
  id: number,
  defaultProvider: T,
  path: string
) => {
  const provider = useProvider<T>(id, defaultProvider, path);

  const {
    pendingChanges,
    setPendingChange,
    unsetPendingChange,
    clearPendingChanges,
  } = usePendingChangesStore<T>({});

  const { save, isSaving, saveError } = useSaveProviderSettings<T>(
    provider.id,
    path,
    clearPendingChanges
  );

  const { settings: item, ...settings } = useMemo(() => {
    return selectSettings<T>(provider, pendingChanges, saveError);
  }, [provider, pendingChanges, saveError]);

  const saveProvider = useCallback(() => {
    save({
      ...provider,
      ...pendingChanges,
    });
  }, [provider, pendingChanges, save]);

  // As in `useManageSettings`, the store records the edit and the caller owns
  // the is-it-a-change comparison, because only the caller holds the saved
  // value to compare against.
  const updateValue = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      if (provider[key] === value) {
        unsetPendingChange(key);
      } else {
        setPendingChange(key, value);
      }
    },
    [provider, setPendingChange, unsetPendingChange]
  );

  return {
    ...settings,
    item,
    updateValue,
    saveProvider,
    isSaving,
    saveError,
  };
};

export const useDeleteProvider = <T extends ModelBase>(
  id: number,
  path: string
) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<void, void>({
    path: `${path}/${id}`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.setQueryData<T[]>([path], (providers = []) => {
          return providers.filter((provider) => provider.id !== id);
        });
      },
    },
  });

  return {
    deleteProvider: mutate,
    isDeleting: isPending,
    deleteError: error,
  };
};
