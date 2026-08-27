import { useMemo } from 'react';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Language from './Language';

const NO_LANGUAGES: Language[] = [];

export const useLanguages = () => {
  const result = useApiQuery<Language[]>({
    path: '/language',
    // The list is compiled into the server -- it cannot change while the app is
    // running -- so it is fetched once for the session, the way the slice it
    // replaces was fetched once by the boot gate.
    queryOptions: { staleTime: Infinity, gcTime: Infinity },
  });

  return {
    ...result,
    data: result.data ?? NO_LANGUAGES,
  };
};

// Sonarr's equivalent takes `{ includeAny: true, ... }` and then tests those
// keys against `language.name`, which is `Any`, so nothing is ever excluded.
// Excluding by name is what every call site here already did by hand, so that
// is what this takes. Pass a constant: the filtered array is memoised on it.
export const useFilteredLanguages = (excludedNames: readonly string[]) => {
  const { data, ...result } = useLanguages();

  const filteredLanguages = useMemo(() => {
    return data.filter((language) => !excludedNames.includes(language.name));
  }, [data, excludedNames]);

  return {
    ...result,
    data: filteredLanguages,
  };
};
