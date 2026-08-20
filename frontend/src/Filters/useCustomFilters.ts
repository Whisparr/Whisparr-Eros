import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { sortByProp } from 'Utilities/Array/sortByProp';
import { CustomFilter } from './Filter';

export const CUSTOM_FILTERS_QUERY_KEY = ['/customFilter'];

const DEFAULT_CUSTOM_FILTERS: CustomFilter[] = [];

const useCustomFilters = () => {
  const result = useApiQuery<CustomFilter[]>({
    path: '/customFilter',
    // Custom filters only ever change through this app's own mutations, and
    // those write their result straight into the cache below. Without this the
    // default staleTime of 0 refetches the whole list every time a page mounts
    // a new observer -- one extra request per navigation, where the redux slice
    // it replaces fetched once for the session.
    queryOptions: { staleTime: Infinity },
  });

  return {
    ...result,
    data: result.data ?? DEFAULT_CUSTOM_FILTERS,
  };
};

export default useCustomFilters;

// `alternateType` exists because the client-side collections key their filters
// off the redux section rather than the page: `movies` items filtered by
// `movieIndex` filters, for instance.
export const useCustomFiltersList = (type: string, alternateType?: string) => {
  const { data } = useCustomFilters();

  return useMemo(() => {
    return data
      .filter((cf) => cf.type === type || cf.type === alternateType)
      .sort(sortByProp('label'));
  }, [data, type, alternateType]);
};

// Mutations write their own result straight into the cache instead of
// invalidating. The modal selects the filter as soon as the mutation resolves
// and the page resolves that id against this cache, so a refetch would leave a
// window where the id matches nothing and the page queries unfiltered.
const useApplyToCache = () => {
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      upsert(customFilter: CustomFilter) {
        queryClient.setQueryData<CustomFilter[]>(
          CUSTOM_FILTERS_QUERY_KEY,
          (existing = DEFAULT_CUSTOM_FILTERS) => {
            if (!existing.some((f) => f.id === customFilter.id)) {
              return [...existing, customFilter];
            }

            return existing.map((f) =>
              f.id === customFilter.id ? customFilter : f
            );
          }
        );
      },

      remove(id: number) {
        queryClient.setQueryData<CustomFilter[]>(
          CUSTOM_FILTERS_QUERY_KEY,
          (existing = DEFAULT_CUSTOM_FILTERS) =>
            existing.filter((f) => f.id !== id)
        );
      },
    }),
    [queryClient]
  );
};

export const useSaveCustomFilter = (id: number | null) => {
  const cache = useApplyToCache();

  const { mutate, isPending, error, data } = useApiMutation<
    CustomFilter,
    Partial<CustomFilter>
  >({
    path: id == null ? '/customFilter' : `/customFilter/${id}`,
    method: id == null ? 'POST' : 'PUT',
    mutationOptions: {
      onSuccess: (customFilter) => {
        cache.upsert(customFilter);
      },
    },
  });

  return {
    saveCustomFilter: mutate,
    isSaving: isPending,
    saveError: error,
    newCustomFilter: data,
  };
};

export const useDeleteCustomFilter = (id: number) => {
  const cache = useApplyToCache();

  const { mutate, isPending, error } = useApiMutation<void, void>({
    path: `/customFilter/${id}`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        cache.remove(id);
      },
    },
  });

  return {
    deleteCustomFilter: mutate,
    isDeleting: isPending,
    deleteError: error,
  };
};
