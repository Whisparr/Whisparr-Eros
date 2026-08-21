import { useQuery } from '@tanstack/react-query';
import fetchJson, { ApiError } from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import { setTranslations } from 'Utilities/String/translate';

interface TranslationsResponse {
  // Whisparr's localization controller serialises PascalCase, where Sonarr's
  // returns `strings`. Reading the wrong one is quiet: every lookup just falls
  // back to its key, which in English mostly still reads like a real label.
  Strings: Record<string, string>;
}

export const TRANSLATIONS_QUERY_KEY = ['/localization'];

// Not `useApiQuery`, because that helper owns the query function and the write
// has to happen inside it. `translate()` reads a module-level record during
// render, so the strings must be in place before anything that waits on this
// query renders. Filling the record from an effect is one paint too late: the
// render that first sees `isFetched` would emit raw keys and nothing would
// re-render to correct them.
function useTranslations() {
  return useQuery<TranslationsResponse, ApiError>({
    queryKey: TRANSLATIONS_QUERY_KEY,
    // The strings only change when the server's language setting does, which
    // requires a restart.
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async ({ signal }) => {
      const response = await fetchJson<TranslationsResponse | string, unknown>({
        path: getQueryPath('/localization'),
        headers: {
          'X-Api-Key': window.Whisparr.apiKey,
          'X-Whisparr-Client': 'Whisparr',
        },
        signal,
      });

      // `GetLocalizationDictionary` returns a pre-serialized JSON *string*, so
      // the shape depends on which formatter content negotiation picks. With
      // the `Accept: application/json` that `fetchJson` always sends, ASP.NET
      // runs that string through the JSON formatter a second time and the body
      // arrives quoted. The jQuery request this replaces only escaped that
      // because its Accept header included `*/*`, which selected the
      // text/plain formatter and returned the JSON untouched.
      const body =
        typeof response === 'string'
          ? (JSON.parse(response) as TranslationsResponse)
          : response;

      setTranslations(body.Strings);

      return body;
    },
  });
}

export default useTranslations;
