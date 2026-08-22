import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAppDimension, useAppDimensions } from 'App/appStore';
import { queryClient } from 'App/queryClient';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Performer from 'Performer/Performer';
import selectSettings from 'Store/Selectors/selectSettings';
import { useSystemStatusData } from 'System/Status/useSystemStatus';
import { InputChanged } from 'typings/inputs';
import getNewPerformer from 'Utilities/Performer/getNewPerformer';
import {
  AddPerformerDefaults,
  setAddPerformerDefault,
  useAddPerformerDefaults,
} from './addPerformerDefaultsStore';

const LOOKUP_DEBOUNCE_MS = 300;
const EXISTING_PATH = '/performer/list';

export interface PerformerWithExistingStatus {
  performer: Performer;
  isExistingPerformer: boolean;
}

interface LookupPerformerItem {
  foreignId: string;
  performer: Performer;
}

function useDebouncedTerm(term: string) {
  const [debounced, setDebounced] = useState(term);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(term), LOOKUP_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [term]);

  // Clearing the box empties the results immediately rather than after the
  // debounce, as dispatching `clearAddPerformer` did.
  return term.trim() === '' ? '' : debounced;
}

function useAddNewPerformer() {
  const [term, setTerm] = useState('');
  const lookupTerm = useDebouncedTerm(term);

  // React Query passes an abort signal, so an in-flight lookup is cancelled
  // when the term moves on. That replaces the module-level `abortCurrentRequest`
  // the thunk kept.
  const {
    data: items,
    error,
    isFetching,
    isSuccess,
  } = useApiQuery<LookupPerformerItem[]>({
    path: '/lookup/performer',
    queryParams: { term: lookupTerm },
    queryOptions: { enabled: lookupTerm !== '' },
  });

  const lookupItems = useMemo(
    () => (lookupTerm === '' ? [] : (items ?? [])),
    [items, lookupTerm]
  );

  const foreignIds = useMemo(
    () => lookupItems.map((item) => item.performer.foreignId).filter(Boolean),
    [lookupItems]
  );

  // `/lookup/performer` answers `isExisting: false` for every result -- unlike
  // the movie and studio lookups, `SearchController` never maps performers
  // against the library -- so existence is asked for separately, as the effect
  // this replaces did.
  const { data: existingPerformers } = useApiQuery<Performer[]>({
    path: EXISTING_PATH,
    method: 'POST',
    body: foreignIds,
    queryOptions: { enabled: foreignIds.length > 0 },
  });

  const performersWithStatus = useMemo((): PerformerWithExistingStatus[] => {
    const existing = new Map(
      (existingPerformers ?? []).map((performer) => [
        performer.foreignId,
        performer,
      ])
    );

    return lookupItems.map((item) => {
      const found = existing.get(item.performer.foreignId);

      return {
        performer: found ?? item.performer,
        isExistingPerformer: !!found,
      };
    });
  }, [lookupItems, existingPerformers]);

  const onPerformerLookupChange = useCallback((value: string) => {
    setTerm(value);
  }, []);

  const onClearPerformerLookupPress = useCallback(() => {
    setTerm('');
  }, []);

  return {
    isPopulated: isSuccess,
    error,
    isFetching,
    items: lookupItems,
    performersWithStatus,
    term,
    onPerformerLookupChange,
    onClearPerformerLookupPress,
  };
}

export function useAddNewPerformerSearchResult() {
  const { isSmallScreen } = useAppDimensions();
  const safeForWorkMode = useContext(SafeForWorkModeContext);

  return { isSmallScreen, safeForWorkMode };
}

export function useAddNewPerformerModalContent(
  performer: Performer,
  onModalClose: () => void
) {
  const isSmallScreen = useAppDimension('isSmallScreen');
  const systemStatus = useSystemStatusData();
  const safeForWorkMode = useContext(SafeForWorkModeContext);
  const defaults = useAddPerformerDefaults();

  const addPerformer = useApiMutation<Performer, Performer>({
    method: 'POST',
    path: '/performer',
    mutationOptions: {
      onSuccess: () => {
        // Re-asks which of the results are in the library. The search result
        // this was opened from switches to its "already in your library" state
        // off the answer, which is also what closed the modal before.
        queryClient.invalidateQueries({ queryKey: [EXISTING_PATH] });
        queryClient.invalidateQueries({ queryKey: ['/performer/paged'] });
      },
    },
  });

  const { settings, validationErrors, validationWarnings } = useMemo(
    () => selectSettings(defaults, {}, addPerformer.error),
    [defaults, addPerformer.error]
  );

  const onInputChange = useCallback(({ name, value }: InputChanged) => {
    setAddPerformerDefault(
      name as keyof AddPerformerDefaults,
      value as AddPerformerDefaults[keyof AddPerformerDefaults]
    );
  }, []);

  const onAddPerformerPress = useCallback(() => {
    addPerformer.mutate({
      ...getNewPerformer(structuredClone(performer), defaults),
      id: 0,
    });
  }, [addPerformer, performer, defaults]);

  useEffect(() => {
    if (addPerformer.isSuccess) {
      onModalClose();
    }
  }, [addPerformer.isSuccess, onModalClose]);

  return {
    addError: addPerformer.error,
    isAdding: addPerformer.isPending,
    isSmallScreen,
    isWindows: systemStatus.isWindows,
    safeForWorkMode,
    settings,
    validationErrors,
    validationWarnings,
    onInputChange,
    onAddPerformerPress,
  };
}

export default useAddNewPerformer;
