import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Error as AppError } from 'App/State/AppSectionState';
import AppState from 'App/State/AppState';
import { ValidationMessage } from 'Components/Form/FormInputGroup';
import {
  addStudio,
  clearAddMovie,
  lookupStudio,
  setAddStudioDefault,
  setStudiosWithStatus,
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
import createAjaxRequest from 'Utilities/createAjaxRequest';

export interface StudioWithExistingStatus {
  studio: Studio;
  isExistingStudio: boolean;
}

interface LookupStudioItem {
  foreignId: string;
  studio: Studio;
  id: string;
  internalId: number;
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

interface AddMovieState {
  isPopulated: boolean;
  error: AppError | null;
  isAdding: boolean;
  isFetching: boolean;
  isAdded: boolean;
  addError: AppError | null;
  items: LookupStudioItem[];
  studiosWithStatus: StudioWithExistingStatus[];
  studioDefaults: StudioDefaults;
}

type RootState = AppState & {
  addMovie: AddMovieState;
};

const defaultStudioDefaults: StudioDefaults = {
  rootFolderPath: '',
  monitored: true,
  moviesMonitored: false,
  qualityProfileId: 0,
  searchForMovie: false,
  tags: [],
};

function useAddNewStudio() {
  const dispatch = useDispatch();
  const addMovie = useSelector((state: RootState) => state.addMovie);
  const uiSettings = useSelector(createUISettingsSelector());
  const existingStudiosCount = useSelector(
    (state: AppState) => state.studios.items.length
  );
  const [term, setTerm] = useState('');

  const studioLookupTimeout = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  React.useEffect(() => {
    dispatch(fetchRootFolders());
    dispatch(fetchQueueDetails());
    return () => {
      if (studioLookupTimeout.current) {
        clearTimeout(studioLookupTimeout.current);
      }
      dispatch(clearAddMovie());
      dispatch(clearQueueDetails());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When lookup results change, check which studios already exist
  React.useEffect(() => {
    if (addMovie?.items && addMovie.items.length > 0) {
      const foreignIds = addMovie.items
        .map((item: LookupStudioItem) => item.studio.foreignId)
        .filter((id: string | undefined) => id);

      if (foreignIds.length > 0) {
        const { request } = createAjaxRequest({
          url: '/studio/list',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(foreignIds),
        });

        request.done((existingStudios: Studio[]) => {
          // Create a map of foreignId to full studio object
          const existingStudioMap = new Map(
            existingStudios.map((s) => [s.foreignId, s])
          );

          // Map over lookup items, using full studio data if available
          const mapped = addMovie.items.map((item: LookupStudioItem) => {
            const fullStudio = existingStudioMap.get(item.studio.foreignId);
            return {
              studio: fullStudio || item.studio,
              isExistingStudio: !!fullStudio,
            };
          });

          dispatch(setStudiosWithStatus(mapped));
        });

        request.fail(() => {
          // If the request fails, assume none exist
          const mapped = addMovie.items.map((item: LookupStudioItem) => ({
            studio: item.studio,
            isExistingStudio: false,
          }));

          dispatch(setStudiosWithStatus(mapped));
        });
      }
    } else {
      dispatch(setStudiosWithStatus([]));
    }
  }, [addMovie?.items, addMovie, dispatch]);

  const onStudioLookupChange = React.useCallback(
    (value: string) => {
      setTerm(value);
      if (studioLookupTimeout.current) {
        clearTimeout(studioLookupTimeout.current);
      }
      if (value.trim() === '') {
        dispatch(clearAddMovie());
      } else {
        studioLookupTimeout.current = setTimeout(() => {
          dispatch(lookupStudio({ term: value }));
        }, 300);
      }
    },
    [dispatch]
  );

  const onClearStudioLookupPress = React.useCallback(() => {
    setTerm('');
    dispatch(clearAddMovie());
  }, [dispatch]);

  return {
    isPopulated: addMovie?.isPopulated || false,
    error: addMovie?.error,
    isAdding: addMovie?.isAdding || false,
    isFetching: addMovie?.isFetching || false,
    isAdded: addMovie?.isAdded || false,
    addError: addMovie?.addError,
    items: addMovie?.items || [],
    studiosWithStatus: addMovie?.studiosWithStatus || [],
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

export function useAddNewStudioModalContent(foreignId: string) {
  const dispatch = useDispatch();
  const { isSmallScreen } = useSelector(createDimensionsSelector());
  const systemStatus = useSelector(createSystemStatusSelector());
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );
  const addMovieState = useSelector((state: RootState) => state.addMovie);

  const {
    isAdding = false,
    addError,
    studioDefaults = defaultStudioDefaults,
  } = addMovieState || {};

  const { settings, validationErrors, validationWarnings } = selectSettings(
    studioDefaults,
    {},
    addError
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
    dispatch(
      addStudio({
        foreignId,
        rootFolderPath: settings.rootFolderPath.value,
        monitored: settings.monitored.value === true,
        moviesMonitored: settings.moviesMonitored.value === true,
        qualityProfileId: settings.qualityProfileId.value,
        searchForMovie: settings.searchForMovie.value,
        tags: settings.tags.value,
      })
    );
  }, [dispatch, foreignId, settings]);

  return {
    addError,
    isAdding,
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
