import { useCallback, useMemo } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import {
  SelectedSchema,
  useProviderSchema,
  useSelectedSchema,
} from 'Settings/useProviderSchema';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';
import ImportList from 'typings/ImportList';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';

export const IMPORT_LISTS_PATH = '/importlist';

const NO_IMPORT_LIST = {} as ImportList;

export const useImportLists = () => {
  return useProviderSettings<ImportList>(IMPORT_LISTS_PATH);
};

export const useSortedImportLists = () => {
  const { data } = useImportLists();

  return useMemo(() => [...data].sort(sortByProp('name')), [data]);
};

export const useImportListsWithIds = (ids: number[]) => {
  const { data } = useImportLists();

  return useMemo(
    () => data.filter((importList) => ids.includes(importList.id)),
    [data, ids]
  );
};

export const useImportListSchema = (enabled = true) => {
  return useProviderSchema<ImportList>(IMPORT_LISTS_PATH, enabled);
};

export const useDeleteImportList = (id: number) => {
  const { deleteProvider, ...result } = useDeleteProvider<ImportList>(
    id,
    IMPORT_LISTS_PATH
  );

  return {
    ...result,
    deleteImportList: deleteProvider,
  };
};

// Same shape as the indexer clone (#538): drop the id so it saves as a new
// provider, and blank every secret, because the API returns those masked and
// sending the mask back stores the mask.
const cloneImportList = (importList: ImportList): ImportList => {
  return {
    ...importList,
    id: 0,
    name: translate('DefaultNameCopiedImportList', { name: importList.name }),
    fields: importList.fields.map((field) => {
      if (field.privacy === 'apiKey' || field.privacy === 'password') {
        return { ...field, value: '' };
      }

      return field;
    }),
  };
};

// The seeding `SELECT_IMPORT_LIST_SCHEMA` did. The two blanks are what that
// reducer set; `minRefreshInterval` comes off the schema, as it always has --
// see the note on the dead prop below.
export const useManageImportList = (
  id: number,
  selectedSchema?: SelectedSchema,
  cloneId?: number
) => {
  const isCloning = cloneId != null;
  const isAdding = id === 0 && !isCloning;

  const schema = useSelectedSchema<ImportList>(
    IMPORT_LISTS_PATH,
    selectedSchema
  );

  // Same query key as the lookup inside `useSelectedSchema`, so this reads the
  // one request rather than making a second.
  const { isSchemaLoading, isSchemaFetched, schemaError } =
    useImportListSchema(isAdding);

  const { data } = useImportLists();
  const importListToClone = useMemo(() => {
    return isCloning
      ? data.find((importList) => importList.id === cloneId)
      : undefined;
  }, [data, cloneId, isCloning]);

  const defaultImportList = useMemo(() => {
    if (importListToClone) {
      return cloneImportList(importListToClone);
    }

    if (!schema) {
      return NO_IMPORT_LIST;
    }

    return {
      ...schema,
      name:
        selectedSchema?.presetName ??
        selectedSchema?.implementationName ??
        schema.implementationName,

      // From the pick, not from `schema`: a preset carries neither its own
      // `implementationName` nor its parent's, so reading it off the schema
      // leaves the modal header as "Add Import List -". `SELECT_IMPORT_LIST_SCHEMA`
      // took it off the dispatch payload for the same reason.
      implementationName:
        selectedSchema?.implementationName ?? schema.implementationName,
      minimumAvailability: 'released',
      rootFolderPath: '',
    };
  }, [importListToClone, schema, selectedSchema]);

  const manage = useManageProviderSettings<ImportList>(
    id,
    defaultImportList,
    IMPORT_LISTS_PATH
  );

  return {
    ...manage,

    // Only the add-from-schema case has anything to wait for; an edit comes
    // from the list the page already loaded, and so does a clone.
    isFetching: isAdding && isSchemaLoading,
    isFetched: isAdding ? isSchemaFetched : true,
    error: isAdding ? schemaError : null,
  };
};

// `/importlist/testall` reports per-list results in its body, which nothing has
// ever read -- the redux handler discarded them too, and the page shows only
// the spinner. Carried over as-is, the same way #538 carried the indexer one.
export const useTestAllImportLists = () => {
  const { mutate, isPending } = useApiMutation<unknown, void>({
    path: `${IMPORT_LISTS_PATH}/testall`,
    method: 'POST',
  });

  return {
    testAllImportLists: mutate,
    isTestingAll: isPending,
  };
};

export interface BulkEditImportLists {
  ids: number[];
  tags?: number[];
  applyTags?: string;
  enabled?: boolean;
  enableAuto?: boolean;
  qualityProfileId?: number;
  minimumAvailability?: string;
  rootFolderPath?: string;
}

// `onSettled` rather than `onSuccess`, because the caller uses it to clear the
// which-button-is-spinning flag and a failed bulk edit has to clear it too.
export const useBulkEditImportLists = (onSettled?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    ImportList[],
    BulkEditImportLists
  >({
    path: `${IMPORT_LISTS_PATH}/bulk`,
    method: 'PUT',
    mutationOptions: {
      onSuccess: (updatedImportLists) => {
        queryClient.setQueryData<ImportList[]>(
          [IMPORT_LISTS_PATH],
          (importLists = []) => {
            return importLists.map((importList) => {
              return (
                updatedImportLists.find(
                  (updated) => updated.id === importList.id
                ) ?? importList
              );
            });
          }
        );
      },
      onSettled,
    },
  });

  return {
    bulkEditImportLists: mutate,
    isSaving: isPending,
    saveError: error,
  };
};

export const useBulkDeleteImportLists = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<void, { ids: number[] }>({
    path: `${IMPORT_LISTS_PATH}/bulk`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: (_data, { ids }) => {
        queryClient.setQueryData<ImportList[]>(
          [IMPORT_LISTS_PATH],
          (importLists = []) => {
            return importLists.filter(
              (importList) => !ids.includes(importList.id)
            );
          }
        );

        onSuccess?.();
      },
    },
  });

  const bulkDeleteImportLists = useCallback(
    (ids: number[]) => mutate({ ids }),
    [mutate]
  );

  return {
    bulkDeleteImportLists,
    isDeleting: isPending,
    deleteError: error,
  };
};
