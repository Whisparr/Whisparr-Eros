import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import useTranslations from 'App/useTranslations';
import useCommands from 'Commands/useCommands';
import useCustomFilters from 'Filters/useCustomFilters';
import { useLanguages } from 'Language/useLanguages';
import { useIndexerFlags } from 'Settings/Indexers/useIndexerFlags';
import { useQualityProfiles } from 'Settings/Profiles/Quality/useQualityProfiles';
import { useUiSettings } from 'Settings/UI/useUiSettings';
import { fetchImportLists } from 'Store/Actions/settingsActions';
import useSystemStatus from 'System/Status/useSystemStatus';
import useTags from 'Tags/useTags';

const createErrorsSelector = () =>
  createSelector(
    (state: AppState) => state.settings.importLists.error,
    (importListsError) => {
      const hasError = !!importListsError;

      return {
        hasError,
        errors: {
          importListsError,
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

  // `translate()` is called during render all over the app, so the whole page
  // waits on the strings exactly as it did on the slice's `isPopulated`.
  const { isFetched: isTranslationsPopulated, error: translationsError } =
    useTranslations();

  // Thirty-odd components call `formatDate` and friends during render, reading
  // the format strings straight out of these settings, so the app waits on the
  // query exactly as it waited on the slice's `isPopulated`.
  const { isFetched: isUiSettingsPopulated, error: uiSettingsError } =
    useUiSettings();

  // Every index row, filter row and profile select resolves a
  // `qualityProfileId` against this query, so the app waits on it exactly as it
  // waited on the slice's `isPopulated` -- otherwise the first paint of an
  // index shows rows with no profile label.
  const { isFetched: isQualityProfilesPopulated, error: qualityProfilesError } =
    useQualityProfiles();

  // Language ids are resolved against this list by every filter row, quality
  // profile and file editor, so the app waits on it exactly as it waited on the
  // slice's `isPopulated`.
  const { isFetched: isLanguagesPopulated, error: languagesError } =
    useLanguages();

  // Release rows, the movie detail page and the file editor all unpack a flag
  // bitmask against this list, so the app waits on it exactly as it waited on
  // the slice's `isPopulated`.
  const { isFetched: isIndexerFlagsPopulated, error: indexerFlagsError } =
    useIndexerFlags();

  // Keeps one observer on the command list for the whole session. SignalR pushes command
  // updates that drive global toasts, and the periodic refetch is what clears finished
  // commands now that the slice's per-command removal timer is gone. The app does not
  // wait on this -- nothing renders differently for want of the command list.
  useCommands();

  const isReduxPopulated = useSelector(
    (state: AppState) => state.settings.importLists.isPopulated
  );

  const isPopulated =
    isReduxPopulated &&
    isIndexerFlagsPopulated &&
    isLanguagesPopulated &&
    isQualityProfilesPopulated &&
    isSystemStatusPopulated &&
    isCustomFiltersPopulated &&
    isTagsPopulated &&
    isTranslationsPopulated &&
    isUiSettingsPopulated;

  const { hasError, errors: reduxErrors } = useSelector(createErrorsSelector());

  const errors = useMemo(() => {
    return {
      ...reduxErrors,
      indexerFlagsError,
      languagesError,
      qualityProfilesError,
      uiSettingsError,
      customFiltersError,
      tagsError,
      translationsError,
      systemStatusError: systemStatusQueryError,
    };
  }, [
    reduxErrors,
    indexerFlagsError,
    languagesError,
    qualityProfilesError,
    uiSettingsError,
    customFiltersError,
    tagsError,
    translationsError,
    systemStatusQueryError,
  ]);

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
    dispatch(fetchImportLists());
  }, [dispatch]);

  return useMemo(() => {
    return {
      errors,
      hasError:
        hasError ||
        !!indexerFlagsError ||
        !!languagesError ||
        !!qualityProfilesError ||
        !!uiSettingsError ||
        !!customFiltersError ||
        !!tagsError ||
        !!translationsError ||
        !!systemStatusQueryError,
      isLocalStorageSupported,
      isPopulated,
    };
  }, [
    errors,
    hasError,
    indexerFlagsError,
    languagesError,
    qualityProfilesError,
    uiSettingsError,
    customFiltersError,
    tagsError,
    translationsError,
    systemStatusQueryError,
    isLocalStorageSupported,
    isPopulated,
  ]);
};

export default useAppPage;
