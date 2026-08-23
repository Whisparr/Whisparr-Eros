import { useCallback, useMemo } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { usePendingItemsStore } from 'Helpers/Hooks/usePendingItemsStore';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import QualityDefinitionModel from 'Quality/QualityDefinitionModel';

export const QUALITY_DEFINITIONS_PATH = '/qualitydefinition';

// One shared array for the not-yet-fetched case, for the same reason
// `useProviderSettings` keeps one: a fresh `[]` per render is a new identity
// for anything that puts the list in a dependency array.
const NO_QUALITY_DEFINITIONS: readonly QualityDefinitionModel[] = [];

export const useQualityDefinitions = () => {
  const result = useApiQuery<QualityDefinitionModel[]>({
    path: QUALITY_DEFINITIONS_PATH,
  });

  return {
    ...result,
    data: result.data ?? NO_QUALITY_DEFINITIONS,
  };
};

// The bulk endpoint is Whisparr's own: `PUT /qualitydefinition/update` takes an
// array and answers with the whole list, where Sonarr PUTs the array to the
// collection path itself. That is why this cannot reuse `useSaveSettings` --
// the path it saves to is not the path the query is keyed on.
export const useSaveQualityDefinitions = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    QualityDefinitionModel[],
    QualityDefinitionModel[]
  >({
    path: `${QUALITY_DEFINITIONS_PATH}/update`,
    method: 'PUT',
    mutationOptions: {
      onSuccess: (updatedDefinitions: QualityDefinitionModel[]) => {
        queryClient.setQueryData<QualityDefinitionModel[]>(
          [QUALITY_DEFINITIONS_PATH],
          updatedDefinitions
        );

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

export const useManageQualityDefinitions = () => {
  const { data, isFetching, isFetched, error } = useQualityDefinitions();

  const {
    setPendingItem,
    clearPendingItems,
    getItemsWithPendingChanges,
    getPendingChangesForSave,
    hasPendingChanges,
  } = usePendingItemsStore<QualityDefinitionModel>();

  const { save, isSaving, saveError } =
    useSaveQualityDefinitions(clearPendingItems);

  const items = useMemo(() => {
    return getItemsWithPendingChanges(data);
  }, [data, getItemsWithPendingChanges]);

  const saveQualityDefinitions = useCallback(() => {
    const updatedDefinitions = getPendingChangesForSave(data);

    // The slice bailed out here rather than flip `isSaving` for an empty PUT,
    // and the toolbar's save button is enabled whenever the page is, so keep
    // the guard.
    if (!updatedDefinitions.length) {
      return;
    }

    save(updatedDefinitions);
  }, [data, getPendingChangesForSave, save]);

  // As in `useManageSettings`, the store records the edit and the caller owns
  // the is-it-a-change comparison, because only the caller holds the saved
  // value to compare against.
  const updateDefinition = useCallback(
    <K extends keyof QualityDefinitionModel>(
      id: number,
      key: K,
      value: QualityDefinitionModel[K]
    ) => {
      setPendingItem(
        id,
        key,
        value,
        data.find((item) => item.id === id)
      );
    },
    [data, setPendingItem]
  );

  return {
    items,
    hasPendingChanges,
    updateDefinition,
    saveQualityDefinitions,
    isFetching,
    isFetched,
    isSaving,
    error,
    saveError,
  };
};
