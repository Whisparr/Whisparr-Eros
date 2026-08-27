import { useMemo } from 'react';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { useManageSettings, useSettings } from 'Settings/useSettings';
import { PendingSection } from 'typings/pending';
import NamingConfig from 'typings/Settings/NamingConfig';
import NamingExample from 'typings/Settings/NamingExample';
import { QueryParams } from 'Utilities/Fetch/getQueryString';

// Sonarr's copies read `/settings/naming`; those routes are API v5, and Eros
// is on v3.
const PATH = '/config/naming';
const EXAMPLES_PATH = '/config/naming/examples';

export const useNamingSettings = () => {
  return useSettings<NamingConfig>(PATH);
};

export const useManageNamingSettings = () => {
  return useManageSettings<NamingConfig>(PATH);
};

// The examples endpoint model-binds a whole `NamingConfigResource` off the
// query string, so the settings go up field by field rather than as a body.
// `id` has to be among them: `GetExamples` treats `id === 0` as "no config was
// supplied" and silently re-reads the saved one, which would render the saved
// formats' examples under the edited formats.
export const useNamingExamples = (settings: PendingSection<NamingConfig>) => {
  const queryParams = useMemo<QueryParams>(() => {
    return Object.entries(settings).reduce((acc, [key, value]) => {
      if (typeof value === 'object' && value !== null && 'value' in value) {
        acc[key] = value.value as QueryParams[string];
      }

      return acc;
    }, {} as QueryParams);
  }, [settings]);

  const { data, error, isFetching } = useApiQuery<NamingExample>({
    path: EXAMPLES_PATH,
    queryParams,
  });

  return {
    examples: data,
    isExamplesFetching: isFetching,
    examplesError: error,
  };
};
