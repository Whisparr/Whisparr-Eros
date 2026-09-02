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
import Indexer from 'typings/Indexer';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';

export const INDEXERS_PATH = '/indexer';

const NO_INDEXER = {} as Indexer;

export const useIndexers = () => {
  return useProviderSettings<Indexer>(INDEXERS_PATH);
};

export const useSortedIndexers = () => {
  const { data } = useIndexers();

  return useMemo(() => [...data].sort(sortByProp('name')), [data]);
};

export const useIndexersWithIds = (ids: number[]) => {
  const { data } = useIndexers();

  return useMemo(
    () => data.filter((indexer) => ids.includes(indexer.id)),
    [data, ids]
  );
};

export const useIndexerSchema = (enabled = true) => {
  return useProviderSchema<Indexer>(INDEXERS_PATH, enabled);
};

export const useDeleteIndexer = (id: number) => {
  const { deleteProvider, ...result } = useDeleteProvider<Indexer>(
    id,
    INDEXERS_PATH
  );

  return {
    ...result,
    deleteIndexer: deleteProvider,
  };
};

// A clone starts from the indexer it copies, minus the things that cannot be
// copied: the id, so it saves as a new provider, and every secret, because the
// API returns those masked and sending the mask back stores the mask.
const cloneIndexer = (indexer: Indexer): Indexer => {
  return {
    ...indexer,
    id: 0,
    name: translate('DefaultNameCopiedProfile', { name: indexer.name }),
    fields: indexer.fields.map((field) => {
      if (field.privacy === 'apiKey' || field.privacy === 'password') {
        return { ...field, value: '' };
      }

      return field;
    }),
  };
};

// Adding from the schema switches on whatever the implementation supports, and
// takes its name from the preset when one was picked. That seeding is what
// `SELECT_INDEXER_SCHEMA` did; the clone branch is `CLONE_INDEXER`.
export const useManageIndexer = (
  id: number,
  selectedSchema?: SelectedSchema,
  cloneId?: number
) => {
  const isCloning = cloneId != null;
  const isAdding = id === 0 && !isCloning;

  const schema = useSelectedSchema<Indexer>(INDEXERS_PATH, selectedSchema);

  // Same query key as the lookup inside `useSelectedSchema`, so this reads the
  // one request rather than making a second.
  const { isSchemaLoading, isSchemaFetched, schemaError } =
    useIndexerSchema(isAdding);

  const { data } = useIndexers();
  const indexerToClone = useMemo(() => {
    return isCloning
      ? data.find((indexer) => indexer.id === cloneId)
      : undefined;
  }, [data, cloneId, isCloning]);

  const defaultIndexer = useMemo(() => {
    if (indexerToClone) {
      return cloneIndexer(indexerToClone);
    }

    if (!schema) {
      return NO_INDEXER;
    }

    return {
      ...schema,
      name: selectedSchema?.presetName ?? schema.implementationName,
      implementationName: schema.implementationName,
      enableRss: schema.supportsRss,
      enableAutomaticSearch: schema.supportsSearch,
      enableInteractiveSearch: schema.supportsSearch,
    };
  }, [indexerToClone, schema, selectedSchema]);

  const manage = useManageProviderSettings<Indexer>(
    id,
    defaultIndexer,
    INDEXERS_PATH
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

// `/indexer/testall` reports per-indexer results in its body, which nothing has
// ever read -- the redux handler discarded them too, and the page shows only
// the spinner. Carried over as-is; surfacing them is its own change.
export const useTestAllIndexers = () => {
  const { mutate, isPending } = useApiMutation<unknown, void>({
    path: `${INDEXERS_PATH}/testall`,
    method: 'POST',
  });

  return {
    testAllIndexers: mutate,
    isTestingAll: isPending,
  };
};

export interface BulkEditIndexers {
  ids: number[];
  tags?: number[];
  applyTags?: string;
  enableRss?: boolean;
  enableAutomaticSearch?: boolean;
  enableInteractiveSearch?: boolean;
  priority?: number;
}

// `onSettled` rather than `onSuccess`, because the caller uses it to clear the
// which-button-is-spinning flag and a failed bulk edit has to clear it too.
export const useBulkEditIndexers = (onSettled?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    Indexer[],
    BulkEditIndexers
  >({
    path: `${INDEXERS_PATH}/bulk`,
    method: 'PUT',
    mutationOptions: {
      onSuccess: (updatedIndexers) => {
        queryClient.setQueryData<Indexer[]>(
          [INDEXERS_PATH],
          (indexers = []) => {
            return indexers.map((indexer) => {
              return (
                updatedIndexers.find((updated) => updated.id === indexer.id) ??
                indexer
              );
            });
          }
        );
      },
      onSettled,
    },
  });

  return {
    bulkEditIndexers: mutate,
    isSaving: isPending,
    saveError: error,
  };
};

export const useBulkDeleteIndexers = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<void, { ids: number[] }>({
    path: `${INDEXERS_PATH}/bulk`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: (_data, { ids }) => {
        queryClient.setQueryData<Indexer[]>(
          [INDEXERS_PATH],
          (indexers = []) => {
            return indexers.filter((indexer) => !ids.includes(indexer.id));
          }
        );

        onSuccess?.();
      },
    },
  });

  const bulkDeleteIndexers = useCallback(
    (ids: number[]) => mutate({ ids }),
    [mutate]
  );

  return {
    bulkDeleteIndexers,
    isDeleting: isPending,
    deleteError: error,
  };
};
