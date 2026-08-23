import { useCallback, useMemo, useRef, useState } from 'react';
import ModelBase from 'App/ModelBase';
import { Error as AppError } from 'App/State/AppSectionState';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { usePendingChangesStore } from 'Helpers/Hooks/usePendingChangesStore';
import { usePendingFieldsStore } from 'Helpers/Hooks/usePendingFieldsStore';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import selectSettings from 'Store/Selectors/selectSettings';
import Field from 'typings/Field';
import Provider from 'typings/Provider';
import { ApiError } from 'Utilities/Fetch/fetchJson';

// One shared array for the not-yet-fetched case, for the same reason
// `useSettings` keeps one shared object: a fresh `[]` per render is a new
// identity for anything that puts the list in a dependency array.
const NO_PROVIDERS: readonly never[] = [];

const hasFields = (provider: unknown): provider is Provider => {
  return (
    typeof provider === 'object' &&
    provider !== null &&
    Array.isArray((provider as Provider).fields)
  );
};

// The body the API expects, which is not the provider as it is held on screen:
// `presets` is schema-only decoration the server rejects, and each field goes
// up as a bare name/value pair. This is what `getProviderState` built for the
// redux handlers.
function getProviderPayload<T extends ModelBase>(
  provider: T,
  pendingChanges: Partial<T>,
  pendingFields: Map<string, unknown>
): T {
  const payload = {
    ...provider,
    ...pendingChanges,
  } as T & { presets?: unknown; fields?: Pick<Field, 'name' | 'value'>[] };

  delete payload.presets;

  if (hasFields(provider)) {
    payload.fields = provider.fields.map(({ name, value }) => ({
      name,
      value: pendingFields.has(name)
        ? (pendingFields.get(name) as Field['value'])
        : value,
    }));
  }

  return payload;
}

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
  onSuccess?: () => void,
  onError?: (error: ApiError) => void
) => {
  const queryClient = useQueryClient();
  const lastSaveData = useRef<string | null>(null);
  const forceSave = useRef(false);

  const { mutate, isPending, error } = useApiMutation<T, T>({
    path: id === 0 ? path : `${path}/${id}`,
    method: id === 0 ? 'POST' : 'PUT',
    queryParams: () => (forceSave.current ? { forceSave: true } : {}),
    mutationOptions: {
      onSuccess: (updatedProvider: T) => {
        lastSaveData.current = null;

        queryClient.setQueryData<T[]>([path], (providers = []) => {
          return id === 0
            ? [...providers, updatedProvider]
            : providers.map((provider) =>
                provider.id === updatedProvider.id ? updatedProvider : provider
              );
        });

        onSuccess?.();
      },
      onError,
    },
  });

  // Pressing Save a second time on an unchanged body is the user answering the
  // warnings the first attempt came back with, so it goes up with `forceSave`,
  // which drops warning-level validation and skips the connectivity test the
  // server would otherwise run.
  const save = useCallback(
    (provider: T) => {
      const saveData = JSON.stringify(provider);

      forceSave.current = saveData === lastSaveData.current;
      lastSaveData.current = saveData;

      mutate(provider);
    },
    [mutate]
  );

  return {
    save,
    isSaving: isPending,
    saveError: error,
  };
};

export const useTestProvider = <T extends ModelBase>(
  path: string,
  onSuccess?: () => void,
  onError?: (error: ApiError) => void
) => {
  const lastTestData = useRef<string | null>(null);
  const forceTest = useRef(false);

  const { mutate, isPending, error } = useApiMutation<void, T>({
    path: `${path}/test`,
    method: 'POST',
    queryParams: () => (forceTest.current ? { forceTest: true } : {}),
    mutationOptions: {
      onSuccess: () => {
        lastTestData.current = null;

        onSuccess?.();
      },
      onError,
    },
  });

  // Same bargain as `forceSave`, minus the skipped test: a repeat Test of an
  // unchanged body means the user has read the warnings and wants the provider
  // contacted anyway.
  const test = useCallback(
    (provider: T) => {
      const testData = JSON.stringify(provider);

      forceTest.current = testData === lastTestData.current;
      lastTestData.current = testData;

      mutate(provider);
    },
    [mutate]
  );

  return {
    test,
    isTesting: isPending,
    testError: error,
  };
};

export const useManageProviderSettings = <T extends ModelBase>(
  id: number,
  defaultProvider: T,
  path: string
) => {
  const provider = useProvider<T>(id, defaultProvider, path);

  // Save and test failures are the same failures -- both come back as
  // validation against the same body, and both have to reach `selectSettings`
  // so the messages land on the fields that caused them. React Query keeps an
  // error per mutation, so they are merged into one piece of state here, and
  // whichever ran last owns it. `AppError` is in the union because an OAuth
  // field reports its own 400 through the same channel.
  const [mutationError, setMutationError] = useState<
    ApiError | AppError | null
  >(null);

  const {
    pendingChanges,
    setPendingChange,
    unsetPendingChange,
    clearPendingChanges,
    hasPendingChanges,
  } = usePendingChangesStore<T>({});

  const {
    pendingFields,
    setPendingField,
    setPendingFields,
    unsetPendingField,
    clearPendingFields,
    hasPendingFields,
  } = usePendingFieldsStore();

  const handleSaveSuccess = useCallback(() => {
    setMutationError(null);
    clearPendingChanges();
    clearPendingFields();
  }, [clearPendingChanges, clearPendingFields]);

  const handleTestSuccess = useCallback(() => {
    setMutationError(null);
  }, []);

  const { save, isSaving } = useSaveProviderSettings<T>(
    provider.id,
    path,
    handleSaveSuccess,
    setMutationError
  );

  const { test, isTesting } = useTestProvider<T>(
    path,
    handleTestSuccess,
    setMutationError
  );

  const { settings: item, ...settings } = useMemo(() => {
    return selectSettings<T>(
      provider,
      hasPendingFields
        ? { ...pendingChanges, fields: Object.fromEntries(pendingFields) }
        : pendingChanges,
      mutationError
    );
  }, [
    provider,
    pendingChanges,
    pendingFields,
    hasPendingFields,
    mutationError,
  ]);

  const saveProvider = useCallback(() => {
    save(getProviderPayload(provider, pendingChanges, pendingFields));
  }, [provider, pendingChanges, pendingFields, save]);

  const testProvider = useCallback(() => {
    test(getProviderPayload(provider, pendingChanges, pendingFields));
  }, [provider, pendingChanges, pendingFields, test]);

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

  const updateFieldValue = useCallback(
    (name: string, value: unknown) => {
      if (!hasFields(provider)) {
        throw new Error(`Provider on ${path} has no fields to update`);
      }

      if (
        provider.fields.find((field) => field.name === name)?.value === value
      ) {
        unsetPendingField(name);
      } else {
        setPendingField(name, value);
      }
    },
    [path, provider, setPendingField, unsetPendingField]
  );

  // The bulk form, for the fields that answer with several values at once --
  // an OAuth callback filling in both a token and the account it belongs to.
  // Unlike the single form it never unsets, because a value that matches what
  // is saved is still part of the batch the caller just produced.
  const updateFieldValues = useCallback(
    (fieldProperties: Record<string, unknown>) => {
      setPendingFields(fieldProperties);
    },
    [setPendingFields]
  );

  return {
    ...settings,
    item,
    hasPendingChanges: hasPendingChanges || hasPendingFields,
    updateValue,
    updateFieldValue,
    updateFieldValues,
    saveProvider,
    isSaving,
    saveError: mutationError,
    setSaveError: setMutationError,
    testProvider,
    isTesting,
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
