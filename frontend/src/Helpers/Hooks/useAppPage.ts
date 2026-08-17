import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import { fetchTranslations } from 'Store/Actions/appActions';
import { fetchCustomFilters } from 'Store/Actions/customFilterActions';
import {
  fetchImportLists,
  fetchIndexerFlags,
  fetchLanguages,
  fetchQualityProfiles,
  fetchUISettings,
} from 'Store/Actions/settingsActions';
import { fetchStatus } from 'Store/Actions/systemActions';
import { fetchTags } from 'Store/Actions/tagActions';
import useSystemStatus from 'System/Status/useSystemStatus';

const createErrorsSelector = () =>
  createSelector(
    (state: AppState) => state.customFilters.error,
    (state: AppState) => state.performers.error,
    (state: AppState) => state.studios.error,
    (state: AppState) => state.tags.error,
    (state: AppState) => state.settings.ui.error,
    (state: AppState) => state.settings.qualityProfiles.error,
    (state: AppState) => state.settings.languages.error,
    (state: AppState) => state.settings.importLists.error,
    (state: AppState) => state.settings.indexerFlags.error,
    (state: AppState) => state.system.status.error,
    (state: AppState) => state.app.translations.error,
    (
      customFiltersError,
      performersError,
      studiosError,
      tagsError,
      uiSettingsError,
      qualityProfilesError,
      languagesError,
      importListsError,
      indexerFlagsError,
      systemStatusError,
      translationsError
    ) => {
      const hasError = !!(
        customFiltersError ||
        performersError ||
        studiosError ||
        tagsError ||
        uiSettingsError ||
        qualityProfilesError ||
        languagesError ||
        importListsError ||
        indexerFlagsError ||
        systemStatusError ||
        translationsError
      );

      return {
        hasError,
        errors: {
          customFiltersError,
          performersError,
          studiosError,
          tagsError,
          uiSettingsError,
          qualityProfilesError,
          languagesError,
          importListsError,
          indexerFlagsError,
          systemStatusError,
          translationsError,
        },
      };
    }
  );

const useAppPage = () => {
  const dispatch = useDispatch();

  // System status is read from React Query by every consumer now, so the app
  // has to wait on that query rather than on the redux slice. Without this,
  // components render once with an undefined status -- Page.tsx would compute
  // `authentication !== 'none'` as true, and path handling would pick the
  // wrong separator. The redux slice below is still populated for About,
  // Stats and FirstRun until those convert.
  const { isSuccess: isSystemStatusPopulated, error: systemStatusQueryError } =
    useSystemStatus();

  const isReduxPopulated = useSelector(
    (state: AppState) =>
      state.customFilters.isPopulated &&
      state.tags.isPopulated &&
      state.settings.ui.isPopulated &&
      state.settings.qualityProfiles.isPopulated &&
      state.settings.languages.isPopulated &&
      state.settings.importLists.isPopulated &&
      state.settings.indexerFlags.isPopulated &&
      state.system.status.isPopulated &&
      state.app.translations.isPopulated
  );

  const isPopulated = isReduxPopulated && isSystemStatusPopulated;

  const { hasError, errors: reduxErrors } = useSelector(createErrorsSelector());

  const errors = useMemo(() => {
    return {
      ...reduxErrors,
      systemStatusError:
        reduxErrors.systemStatusError ?? systemStatusQueryError,
    };
  }, [reduxErrors, systemStatusQueryError]);

  const isLocalStorageSupported = useMemo(() => {
    const key = 'whisparrTest';

    try {
      localStorage.setItem(key, key);
      localStorage.removeItem(key);

      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    dispatch(fetchCustomFilters());
    dispatch(fetchTags());
    dispatch(fetchQualityProfiles());
    dispatch(fetchLanguages());
    dispatch(fetchImportLists());
    dispatch(fetchIndexerFlags());
    dispatch(fetchUISettings());
    dispatch(fetchStatus());
    dispatch(fetchTranslations());
  }, [dispatch]);

  return useMemo(() => {
    return {
      errors,
      hasError: hasError || !!systemStatusQueryError,
      isLocalStorageSupported,
      isPopulated,
    };
  }, [
    errors,
    hasError,
    systemStatusQueryError,
    isLocalStorageSupported,
    isPopulated,
  ]);
};

export default useAppPage;
