import { useMutation } from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import { ValidationMessage } from 'Components/Form/FormInputGroup';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import {
  setAddStudioDefault,
} from 'Store/Actions/addMovieActions';
import {
  clearQueueDetails,
  fetchQueueDetails,
} from 'Store/Actions/queueActions';
import { fetchRootFolders } from 'Store/Actions/rootFolderActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import createSystemStatusSelector from 'Store/Selectors/createSystemStatusSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import Studio from 'Studio/Studio';
import { InputChanged } from 'typings/inputs';
import fetchJson, {
  ApiError,
  apiRoot,
  urlBase,
} from 'Utilities/Fetch/fetchJson';
import getNewStudio from 'Utilities/Studio/getNewStudio';

export interface StudioWithExistingStatus {
  studio: Studio;
  isExistingStudio: boolean;
}

interface StudioDefaults {
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

interface AddStudioSettings {
  rootFolderPath: SettingValue<string>;
  monitored: SettingValue<boolean>;
  moviesMonitored: SettingValue<boolean>;
  qualityProfileId: SettingValue<number>;
  searchForMovie: SettingValue<boolean>;
  tags: SettingValue<number[]>;
}

const defaultStudioDefaults: StudioDefaults = {
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
  studio: Studio;
  isExisting: boolean;
}

function useAddNewStudio() {
  const dispatch = useDispatch();
  const uiSettings = useSelector(createUISettingsSelector());
  const existingStudiosCount = useSelector(
    (state: AppState) => state.studios.items.length
  );
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
      dispatch(clearQueueDetails());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: searchResources = [],
    isFetching,
    error,
  } = useApiQuery<SearchResource[]>({
    path: '/lookup/studio',
    queryParams: { term: debouncedTerm },
    queryOptions: { enabled: !!debouncedTerm.trim() },
  });

  const onStudioLookupChange = React.useCallback(
    (value: string) => {
      setTerm(value);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (value.trim() === '') {
        setDebouncedTerm('');
      } else {
        timeoutRef.current = setTimeout(() => {
          setDebouncedTerm(value);
        }, 300);
      }
    },
    [dispatch]
  );

  const onClearStudioLookupPress = React.useCallback(() => {
    setTerm('');
    setDebouncedTerm('');
  }, []);

  return {
    isPopulated: !!debouncedTerm.trim() && !isFetching,
    error,
    isAdding: false,
    isFetching: isFetching && !!debouncedTerm.trim(),
    isAdded: false,
    addError: null,
    items: searchResources,
    studiosWithStatus: searchResources.map((r) => ({
      studio: r.studio,
      isExistingStudio: r.isExisting,
    })),
    term,
    colorImpairedMode: uiSettings.enableColorImpairedMode,
    hasExistingStudios: existingStudiosCount > 0,
    onStudioLookupChange,
    onClearStudioLookupPress,
  };
}

export function useAddNewStudioSearchResult() {
  const dimensions = useSelector(createDimensionsSelector());
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  return {
    isSmallScreen: dimensions.isSmallScreen,
    safeForWorkMode,
  };
}

export function useAddNewStudioModalContent(studio: Studio) {
  const dispatch = useDispatch();
  const { isSmallScreen } = useSelector(createDimensionsSelector());
  const systemStatus = useSelector(createSystemStatusSelector());
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const addMovieState = useSelector(
    (
      state: AppState & {
        addMovie: { studioDefaults: StudioDefaults; addError?: ApiError };
      }
    ) => state.addMovie
  );

  const { studioDefaults = defaultStudioDefaults } = addMovieState || {};

  const mutation = useMutation<Studio, ApiError, Studio>({
    mutationFn: (studioToAdd: Studio) => {
      return apiPost<Studio, Studio>('/studio', studioToAdd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/studio/paged'] });
      queryClient.invalidateQueries({ queryKey: ['/lookup/studio'] });
    },
  });

  const { settings, validationErrors, validationWarnings } = selectSettings(
    studioDefaults,
    {},
    mutation.error
  ) as {
    settings: AddStudioSettings;
    validationErrors: unknown[];
    validationWarnings: unknown[];
  };

  const onInputChange = React.useCallback(
    (change: InputChanged) => {
      dispatch(setAddStudioDefault({ [change.name]: change.value }));
    },
    [dispatch]
  );

  const onAddStudioPress = React.useCallback(() => {
    const studioToAdd = getNewStudio(cloneDeep(studio) as object, {
      rootFolderPath: settings.rootFolderPath.value,
      monitored: settings.monitored.value === true,
      moviesMonitored: settings.moviesMonitored.value === true,
      qualityProfileId: settings.qualityProfileId.value,
      searchForMovie: settings.searchForMovie.value,
      tags: settings.tags.value,
    }) as Studio;
    studioToAdd.id = 0;
    mutation.mutate(studioToAdd);
  }, [studio, settings, mutation]);

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
    onAddStudioPress,
  };
}

export default useAddNewStudio;
