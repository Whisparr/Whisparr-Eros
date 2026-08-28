import { cloneDeep } from 'lodash';
import React, { useRef, useState } from 'react';
import { useAppDimension, useAppDimensions } from 'App/appStore';
import { queryClient } from 'App/queryClient';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import { ValidationMessage } from 'Components/Form/FormInputGroup';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import selectSettings from 'Helpers/selectSettings';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import Studio from 'Studio/Studio';
import { useSystemStatusData } from 'System/Status/useSystemStatus';
import { InputChanged } from 'typings/inputs';
import getNewStudio from 'Utilities/Studio/getNewStudio';
import {
  AddStudioDefaults,
  setAddStudioDefault,
  useAddStudioDefaults,
} from './addStudioDefaultsStore';

export interface StudioWithExistingStatus {
  studio: Studio;
  isExistingStudio: boolean;
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

interface SearchResource {
  foreignId: string;
  studio: Studio;
  isExisting: boolean;
}

function useAddNewStudio() {
  const uiSettings = useUiSettingsValues();
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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

  const onStudioLookupChange = React.useCallback((value: string) => {
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
  }, []);

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
    onStudioLookupChange,
    onClearStudioLookupPress,
  };
}

export function useAddNewStudioSearchResult() {
  const dimensions = useAppDimensions();
  const safeForWorkMode = useSafeForWorkMode();

  return {
    isSmallScreen: dimensions.isSmallScreen,
    safeForWorkMode,
  };
}

export function useAddNewStudioModalContent(studio: Studio) {
  const isSmallScreen = useAppDimension('isSmallScreen');
  const systemStatus = useSystemStatusData();
  const safeForWorkMode = useSafeForWorkMode();

  const studioDefaults = useAddStudioDefaults();

  const mutation = useApiMutation<Studio, Studio>({
    method: 'POST',
    path: '/studio',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/studio/paged'] });
        queryClient.invalidateQueries({ queryKey: ['/lookup/studio'] });
      },
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

  const onInputChange = React.useCallback(({ name, value }: InputChanged) => {
    setAddStudioDefault(
      name as keyof AddStudioDefaults,
      value as AddStudioDefaults[keyof AddStudioDefaults]
    );
  }, []);

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
