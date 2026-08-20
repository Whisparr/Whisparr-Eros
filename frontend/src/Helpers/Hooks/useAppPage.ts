import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import useCommands from 'Commands/useCommands';
import useCustomFilters from 'Filters/useCustomFilters';
import { fetchTranslations } from 'Store/Actions/appActions';
import {
  fetchImportLists,
  fetchIndexerFlags,
  fetchLanguages,
  fetchQualityProfiles,
  fetchUISettings,
} from 'Store/Actions/settingsActions';
import useSystemStatus from 'System/Status/useSystemStatus';
import useTags from 'Tags/useTags';

const createErrorsSelector = () =>
  createSelector(
    (state: AppState) => state.performers.error,
    (state: AppState) => state.studios.error,
    (state: AppState) => state.settings.ui.error,
    (state: AppState) => state.settings.qualityProfiles.error,
    (state: AppState) => state.settings.languages.error,
    (state: AppState) => state.settings.importLists.error,
    (state: AppState) => state.settings.indexerFlags.error,
    (state: AppState) => state.app.translations.error,
    (
      performersError,
      studiosError,
      uiSettingsError,
      qualityProfilesError,
      languagesError,
      importListsError,
      indexerFlagsError,
      translationsError
    ) => {
      const hasError = !!(
        performersError ||
        studiosError ||
        uiSettingsError ||
        qualityProfilesError ||
        languagesError ||
        importListsError ||
        indexerFlagsError ||
        translationsError
      );

      return {
        hasError,
        errors: {
          performersError,
          studiosError,
          uiSettingsError,
          qualityProfilesError,
          languagesError,
          importListsError,
          indexerFlagsError,
          translationsError,
        },
      };
    }
  );

const useAppPage = () => {
  const dispatch = useDispatch();

  // System status is read from React Query by every consumer now, so the app
  // waits on that query. Without this, components render once with an
  // undefined status -- Page.tsx would compute `authentication !== 'none'` as
  // true, and path handling would pick the wrong separator.
  const { isSuccess: isSystemStatusPopulated, error: systemStatusQueryError } =
    useSystemStatus();

  // Every page that offers a filter menu resolves its selected filter key
  // against this query, and the index pages send the result to the server. The
  // app must not render a page before it resolves, or the first request goes
  // out unfiltered and the user sees the whole library flash past.
  const { isFetched: isCustomFiltersPopulated, error: customFiltersError } =
    useCustomFilters();

  // Tags gate the app for the same reason custom filters do: MovieTagInput and
  // every tag filter resolve ids against this list, so rendering before it
  // arrives shows a row of tagless inputs that fill in a moment later.
  const { isFetched: isTagsPopulated, error: tagsError } = useTags();

  // Keeps one observer on the command list for the whole session. SignalR pushes command
  // updates that drive global toasts, and the periodic refetch is what clears finished
  // commands now that the slice's per-command removal timer is gone. The app does not
  // wait on this -- nothing renders differently for want of the command list.
  useCommands();

  const isReduxPopulated = useSelector(
    (state: AppState) =>
      state.settings.ui.isPopulated &&
      state.settings.qualityProfiles.isPopulated &&
      state.settings.languages.isPopulated &&
      state.settings.importLists.isPopulated &&
      state.settings.indexerFlags.isPopulated &&
      state.app.translations.isPopulated
  );

  const isPopulated =
    isReduxPopulated &&
    isSystemStatusPopulated &&
    isCustomFiltersPopulated &&
    isTagsPopulated;

  const { hasError, errors: reduxErrors } = useSelector(createErrorsSelector());

  const errors = useMemo(() => {
    return {
      ...reduxErrors,
      customFiltersError,
      tagsError,
      systemStatusError: systemStatusQueryError,
    };
  }, [reduxErrors, customFiltersError, tagsError, systemStatusQueryError]);

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
    dispatch(fetchQualityProfiles());
    dispatch(fetchLanguages());
    dispatch(fetchImportLists());
    dispatch(fetchIndexerFlags());
    dispatch(fetchUISettings());
    dispatch(fetchTranslations());
  }, [dispatch]);

  return useMemo(() => {
    return {
      errors,
      hasError:
        hasError ||
        !!customFiltersError ||
        !!tagsError ||
        !!systemStatusQueryError,
      isLocalStorageSupported,
      isPopulated,
    };
  }, [
    errors,
    hasError,
    customFiltersError,
    tagsError,
    systemStatusQueryError,
    isLocalStorageSupported,
    isPopulated,
  ]);
};

export default useAppPage;
