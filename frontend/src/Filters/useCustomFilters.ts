import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import { removeItem, updateItem } from 'Store/Actions/baseActions';
import { CustomFilter } from './Filter';

// Reads still come from the `customFilters` redux slice: `createCustomFilters-
// Selector` has 20 call sites, and `createClientSideCollectionSelector` uses it
// internally for Interactive Search and Collection. Those move to a query hook
// in Phase C part two, which is also when this slice goes.
//
// Until then a mutation has to put its own result into the slice. Re-fetching
// instead would race: the modal selects the new filter as soon as the mutation
// resolves, and the page resolves that id against redux, so a filter that
// hasn't landed yet reads as "no filters" and the page queries unfiltered.
const SECTION = 'customFilters';

const useApplySaved = () => {
  const dispatch = useDispatch();

  return useCallback(
    (customFilter: CustomFilter) => {
      dispatch(updateItem({ section: SECTION, ...customFilter }));
    },
    [dispatch]
  );
};

export const useSaveCustomFilter = (id: number | null) => {
  const applySaved = useApplySaved();

  const { mutate, isPending, error, data } = useApiMutation<
    CustomFilter,
    Partial<CustomFilter>
  >({
    path: id == null ? '/customFilter' : `/customFilter/${id}`,
    method: id == null ? 'POST' : 'PUT',
    mutationOptions: {
      onSuccess: (customFilter) => {
        applySaved(customFilter);
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
  const dispatch = useDispatch();

  const { mutate, isPending, error } = useApiMutation<void, void>({
    path: `/customFilter/${id}`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        dispatch(removeItem({ section: SECTION, id }));
      },
    },
  });

  return {
    deleteCustomFilter: mutate,
    isDeleting: isPending,
    deleteError: error,
  };
};
