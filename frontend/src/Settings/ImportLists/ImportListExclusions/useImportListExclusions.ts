import { useCallback, useMemo } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import usePage from 'Helpers/Hooks/usePage';
import usePagedApiQuery from 'Helpers/Hooks/usePagedApiQuery';
import { usePendingChangesStore } from 'Helpers/Hooks/usePendingChangesStore';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import selectSettings from 'Store/Selectors/selectSettings';
import ImportListExclusion from 'typings/ImportListExclusion';
import { useImportListExclusionOptions } from './importListExclusionOptionsStore';

export const IMPORT_LIST_EXCLUSIONS_PATH = '/exclusions';
export const PAGED_IMPORT_LIST_EXCLUSIONS_PATH = `${IMPORT_LIST_EXCLUSIONS_PATH}/paged`;

// What the add form starts from. The cast covers the two fields it has no
// business inventing: the server assigns the id, and `reason` records why the
// exclusion exists -- one added here is Manual, which is the model's default.
const NEW_IMPORT_LIST_EXCLUSION = {
  foreignId: '',
  movieTitle: '',
  type: 'scene',
} as ImportListExclusion;

// The only paged section in Settings, so the list is a page rather than a
// collection and this reaches for `usePagedApiQuery` instead of the provider
// hooks the rest of Settings uses. Nothing patches the cache after a write for
// the same reason: a page is a server-side slice of an ordering the client
// does not hold, so every mutation invalidates the path and the page on screen
// refetches itself.
const useImportListExclusions = () => {
  const { page, goToPage } = usePage('importListExclusion');
  const { pageSize, sortKey, sortDirection } = useImportListExclusionOptions();

  return {
    ...usePagedApiQuery<ImportListExclusion>({
      path: PAGED_IMPORT_LIST_EXCLUSIONS_PATH,
      page,
      pageSize,
      sortKey,
      sortDirection,
    }),
    page,
    goToPage,
  };
};

export default useImportListExclusions;

export const useManageImportListExclusion = (
  importListExclusion?: ImportListExclusion
) => {
  const queryClient = useQueryClient();

  const savedItem = importListExclusion ?? NEW_IMPORT_LIST_EXCLUSION;

  const { pendingChanges, setPendingChange, unsetPendingChange } =
    usePendingChangesStore<ImportListExclusion>({});

  const {
    mutate,
    isPending: isSaving,
    error: saveError,
  } = useApiMutation<ImportListExclusion, Partial<ImportListExclusion>>({
    path: importListExclusion
      ? `${IMPORT_LIST_EXCLUSIONS_PATH}/${importListExclusion.id}`
      : IMPORT_LIST_EXCLUSIONS_PATH,
    method: importListExclusion ? 'PUT' : 'POST',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [PAGED_IMPORT_LIST_EXCLUSIONS_PATH],
        });
      },
    },
  });

  const { settings: item, ...settings } = useMemo(() => {
    return selectSettings<ImportListExclusion>(
      savedItem,
      pendingChanges,
      saveError
    );
  }, [savedItem, pendingChanges, saveError]);

  const updateValue = useCallback(
    <K extends keyof ImportListExclusion>(
      key: K,
      value: ImportListExclusion[K]
    ) => {
      if (savedItem[key] === value) {
        unsetPendingChange(key);
      } else {
        setPendingChange(key, value);
      }
    },
    [savedItem, setPendingChange, unsetPendingChange]
  );

  // The whole record goes up, not the three fields the form shows. `reason` is
  // one of the two the form leaves alone, and the API takes an absent one as
  // Manual -- so sending only the form's fields would quietly re-label an
  // exclusion the studio or the delete dialog had added.
  const save = useCallback(() => {
    mutate({ ...savedItem, ...pendingChanges });
  }, [savedItem, pendingChanges, mutate]);

  return {
    ...settings,
    item,
    isSaving,
    saveError,
    updateValue,
    save,
  };
};

export const useDeleteImportListExclusion = (id: number) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<void, void>({
    path: `${IMPORT_LIST_EXCLUSIONS_PATH}/${id}`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [PAGED_IMPORT_LIST_EXCLUSIONS_PATH],
        });
      },
    },
  });

  return {
    deleteImportListExclusion: mutate,
    isDeleting: isPending,
    deleteError: error,
  };
};

// `onSuccess` clears the selection, which only the caller can do: the rows it
// held are about to be replaced by the refetched page.
export const useDeleteImportListExclusions = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    unknown,
    { ids: number[] }
  >({
    path: `${IMPORT_LIST_EXCLUSIONS_PATH}/bulk`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [PAGED_IMPORT_LIST_EXCLUSIONS_PATH],
        });

        onSuccess?.();
      },
    },
  });

  const deleteImportListExclusions = useCallback(
    (ids: number[]) => mutate({ ids }),
    [mutate]
  );

  return {
    deleteImportListExclusions,
    isDeleting: isPending,
    deleteError: error,
  };
};
