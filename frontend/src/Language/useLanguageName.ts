import moment from 'moment';
import { useCallback, useEffect } from 'react';
import useApiQuery from 'Helpers/Hooks/useApiQuery';

interface LanguageResponse {
  identifier: string;
}

function getDisplayName(code: string) {
  return Intl.DisplayNames
    ? new Intl.DisplayNames([code], { type: 'language' })
    : null;
}

const useLanguage = () => {
  return useApiQuery<LanguageResponse>({
    path: '/localization/language',
    // The UI language cannot change without a reload, so this is fetched once
    // for the session -- the module-level singleton it replaces fetched once
    // too, but did so on import, outside React's knowledge.
    queryOptions: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  });
};

export const useInitializeLanguage = () => {
  const { data } = useLanguage();

  // Also points moment at the UI language, so the month and day names it
  // formats follow the same setting the day-of-week strings do. An identifier
  // moment does not recognise leaves the current locale in place.
  useEffect(() => {
    moment.locale(data?.identifier);
  }, [data]);
};

const useLanguageName = () => {
  const { data } = useLanguage();

  const getLanguageName = useCallback(
    (code: string): string => {
      const languageNames = data?.identifier
        ? getDisplayName(data.identifier)
        : getDisplayName('en');

      if (!languageNames) {
        return code;
      }

      try {
        return languageNames.of(code) ?? code;
      } catch {
        return code;
      }
    },
    [data]
  );

  return getLanguageName;
};

export default useLanguageName;
