import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Error as AppError } from 'App/State/AppSectionState';
import AppState from 'App/State/AppState';
import { ValidationMessage } from 'Components/Form/FormInputGroup';
import Performer from 'Performer/Performer';
import {
  addPerformer,
  clearAddPerformer,
  lookupPerformer,
  setAddPerformerDefault,
  setPerformersWithStatus,
} from 'Store/Actions/addPerformerActions';
import {} from 'Store/Actions/queueActions';
import { fetchRootFolders } from 'Store/Actions/rootFolderActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import { useSystemStatusData } from 'System/Status/useSystemStatus';
import { InputChanged } from 'typings/inputs';
import createAjaxRequest from 'Utilities/createAjaxRequest';

export interface PerformerWithExistingStatus {
  performer: Performer;
  isExistingPerformer: boolean;
}

interface LookupPerformerItem {
  foreignId: string;
  performer: Performer;
  id: string;
  internalId: number;
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

interface AddPerformerState {
  isPopulated: boolean;
  error: AppError | null;
  isAdding: boolean;
  isFetching: boolean;
  isAdded: boolean;
  addError: AppError | null;
  items: LookupPerformerItem[];
  performersWithStatus: PerformerWithExistingStatus[];
  performerDefaults: PerformerDefaults;
}

type RootState = AppState & {
  addPerformer: AddPerformerState;
};

const defaultPerformerDefaults: PerformerDefaults = {
  rootFolderPath: '',
  monitored: true,
  moviesMonitored: false,
  qualityProfileId: 0,
  searchForMovie: false,
  tags: [],
};

function useAddNewPerformer() {
  const dispatch = useDispatch();
  const addPerformer = useSelector((state: RootState) => state.addPerformer);
  const uiSettings = useSelector(createUISettingsSelector());
  const [term, setTerm] = useState('');

  const performerLookupTimeout = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  React.useEffect(() => {
    dispatch(fetchRootFolders());
    return () => {
      if (performerLookupTimeout.current) {
        clearTimeout(performerLookupTimeout.current);
      }
      dispatch(clearAddPerformer());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When lookup results change, check which performers already exist
  React.useEffect(() => {
    if (addPerformer?.items && addPerformer.items.length > 0) {
      const foreignIds = addPerformer.items
        .map((item: LookupPerformerItem) => item.performer.foreignId)
        .filter((id: string | undefined) => id);

      if (foreignIds.length > 0) {
        const { request } = createAjaxRequest({
          url: '/performer/list',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(foreignIds),
        });

        request.done((existingPerformers: Performer[]) => {
          // Create a map of foreignId to full performer object
          const existingPerformerMap = new Map(
            existingPerformers.map((p) => [p.foreignId, p])
          );

          // Map over lookup items, using full performer data if available
          const mapped = addPerformer.items.map((item: LookupPerformerItem) => {
            const fullPerformer = existingPerformerMap.get(
              item.performer.foreignId
            );
            return {
              performer: fullPerformer || item.performer,
              isExistingPerformer: !!fullPerformer,
            };
          });

          dispatch(setPerformersWithStatus(mapped));
        });

        request.fail(() => {
          // If the request fails, assume none exist
          const mapped = addPerformer.items.map(
            (item: LookupPerformerItem) => ({
              performer: item.performer,
              isExistingPerformer: false,
            })
          );

          dispatch(setPerformersWithStatus(mapped));
        });
      }
    } else {
      dispatch(setPerformersWithStatus([]));
    }
  }, [addPerformer?.items, addPerformer?.isAdding, dispatch]);

  const onPerformerLookupChange = React.useCallback(
    (value: string) => {
      setTerm(value);
      if (performerLookupTimeout.current) {
        clearTimeout(performerLookupTimeout.current);
      }
      if (value.trim() === '') {
        dispatch(clearAddPerformer());
      } else {
        performerLookupTimeout.current = setTimeout(() => {
          dispatch(lookupPerformer({ term: value }));
        }, 300);
      }
    },
    [dispatch]
  );

  const onClearPerformerLookupPress = React.useCallback(() => {
    setTerm('');
    dispatch(clearAddPerformer());
  }, [dispatch]);

  return {
    isPopulated: addPerformer?.isPopulated || false,
    error: addPerformer?.error,
    isAdding: addPerformer?.isAdding || false,
    isFetching: addPerformer?.isFetching || false,
    isAdded: addPerformer?.isAdded || false,
    addError: addPerformer?.addError,
    items: addPerformer?.items || [],
    performersWithStatus: addPerformer?.performersWithStatus || [],
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

export function useAddNewPerformerModalContent(foreignId: string) {
  const dispatch = useDispatch();
  const { isSmallScreen } = useSelector(createDimensionsSelector());
  const systemStatus = useSystemStatusData();
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );
  const addPerformerState = useSelector(
    (state: RootState) => state.addPerformer
  );

  const {
    isAdding = false,
    addError,
    performerDefaults = defaultPerformerDefaults,
  } = addPerformerState || {};

  const { settings, validationErrors, validationWarnings } = selectSettings(
    performerDefaults,
    {},
    addError
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
    dispatch(
      addPerformer({
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
    onAddPerformerPress,
  };
}

export default useAddNewPerformer;
