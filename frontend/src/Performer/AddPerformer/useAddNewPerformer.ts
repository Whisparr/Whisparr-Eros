import { useMutation } from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import { ValidationMessage } from 'Components/Form/FormInputGroup';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Performer from 'Performer/Performer';
import {
  clearAddPerformer,
  setAddPerformerDefault,
} from 'Store/Actions/addPerformerActions';
import {
  clearQueueDetails,
  fetchQueueDetails,
} from 'Store/Actions/queueActions';
import { fetchRootFolders } from 'Store/Actions/rootFolderActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import createSystemStatusSelector from 'Store/Selectors/createSystemStatusSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import { InputChanged } from 'typings/inputs';
import fetchJson, {
  ApiError,
  apiRoot,
  urlBase,
} from 'Utilities/Fetch/fetchJson';
import getNewPerformer from 'Utilities/Performer/getNewPerformer';

export interface PerformerWithExistingStatus {
  performer: Performer;
  isExistingPerformer: boolean;
}

interface PerformerDefaults {
  rootFolderPath: string;
  monitored: boolean;
  moviesMonitored: boolean;
  qualityProfileId: number;
  searchForMovie: boolean;
  tags: number[];
}

interface SettingValue<T> {
  value: T;
  errors?: ValidationMessage[];
  warnings?: ValidationMessage[];
  pending?: boolean;
  previousValue?: T;
}

interface AddPerformerSettings {
  rootFolderPath: SettingValue<string>;
  monitored: SettingValue<boolean>;
  moviesMonitored: SettingValue<boolean>;
  qualityProfileId: SettingValue<number>;
  searchForMovie: SettingValue<boolean>;
  tags: SettingValue<number[]>;
}

const defaultPerformerDefaults: PerformerDefaults = {
  rootFolderPath: '',
  monitored: true,
  moviesMonitored: false,
  qualityProfileId: 0,
  searchForMovie: false,
  tags: [],
};

const AUTH_HEADERS = {
  'X-Api-Key': window.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};

function apiPost<T, TBody>(path: string, body: TBody): Promise<T> {
  return fetchJson<T, TBody>({
    path: `${urlBase}${apiRoot}${path}`,
    method: 'POST',
    body,
    headers: AUTH_HEADERS,
  });
}

interface SearchResource {
  foreignId: string;
  performer: Performer;
  isExisting: boolean;
}

function useAddNewPerformer() {
  const dispatch = useDispatch();
  const uiSettings = useSelector(createUISettingsSelector());
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    dispatch(fetchRootFolders());
    dispatch(fetchQueueDetails());
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      dispatch(clearAddPerformer());
      dispatch(clearQueueDetails());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: searchResources = [],
    isFetching,
    error,
  } = useApiQuery<SearchResource[]>({
    path: '/lookup/performer',
    queryParams: { term: debouncedTerm },
    queryOptions: { enabled: !!debouncedTerm.trim() },
  });

  const onPerformerLookupChange = React.useCallback(
    (value: string) => {
      setTerm(value);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (value.trim() === '') {
        setDebouncedTerm('');
        dispatch(clearAddPerformer());
      } else {
        timeoutRef.current = setTimeout(() => {
          setDebouncedTerm(value);
        }, 300);
      }
    },
    [dispatch]
  );

  const onClearPerformerLookupPress = React.useCallback(() => {
    setTerm('');
    setDebouncedTerm('');
    dispatch(clearAddPerformer());
  }, [dispatch]);

  return {
    isPopulated: !!debouncedTerm.trim() && !isFetching,
    error,
    isAdding: false,
    isFetching: isFetching && !!debouncedTerm.trim(),
    isAdded: false,
    addError: null,
    items: searchResources,
    performersWithStatus: searchResources.map((r) => ({
      performer: r.performer,
      isExistingPerformer: r.isExisting,
    })),
    term,
    colorImpairedMode: uiSettings.enableColorImpairedMode,
    onPerformerLookupChange,
    onClearPerformerLookupPress,
  };
}

export function useAddNewPerformerSearchResult() {
  const dimensions = useSelector(createDimensionsSelector());
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  return {
    isSmallScreen: dimensions.isSmallScreen,
    safeForWorkMode,
  };
}

export function useAddNewPerformerModalContent(performer: Performer) {
  const dispatch = useDispatch();
  const { isSmallScreen } = useSelector(createDimensionsSelector());
  const systemStatus = useSelector(createSystemStatusSelector());
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const addPerformerState = useSelector(
    (
      state: AppState & {
        addPerformer: {
          performerDefaults: PerformerDefaults;
          addError?: ApiError;
        };
      }
    ) => state.addPerformer
  );

  const { performerDefaults = defaultPerformerDefaults } =
    addPerformerState || {};

  const mutation = useMutation<Performer, ApiError, Performer>({
    mutationFn: (performerToAdd: Performer) => {
      return apiPost<Performer, Performer>('/performer', performerToAdd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/performer/paged'] });
      queryClient.invalidateQueries({ queryKey: ['/lookup/performer'] });
    },
  });

  const { settings, validationErrors, validationWarnings } = selectSettings(
    performerDefaults,
    {},
    mutation.error
  ) as {
    settings: AddPerformerSettings;
    validationErrors: unknown[];
    validationWarnings: unknown[];
  };

  const onInputChange = React.useCallback(
    (change: InputChanged) => {
      dispatch(setAddPerformerDefault({ [change.name]: change.value }));
    },
    [dispatch]
  );

  const onAddPerformerPress = React.useCallback(() => {
    const performerToAdd = getNewPerformer(cloneDeep(performer) as object, {
      rootFolderPath: settings.rootFolderPath.value,
      monitored: settings.monitored.value === true,
      moviesMonitored: settings.moviesMonitored.value === true,
      qualityProfileId: settings.qualityProfileId.value,
      searchForMovie: settings.searchForMovie.value,
      tags: settings.tags.value,
    }) as Performer;
    performerToAdd.id = 0;
    mutation.mutate(performerToAdd);
  }, [performer, settings, mutation]);

  return {
    addError: mutation.error,
    isAdding: mutation.isPending,
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
