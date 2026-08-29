import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';

interface LanguageResponse {
  identifier: string;
}

function getLanguage() {
  return fetchJson<LanguageResponse, never>({
    path: getQueryPath('/localization/language'),
    headers: {
      'X-Api-Key': window.Whisparr.apiKey,
    },
  });
}

function getDisplayName(code: string) {
  return Intl.DisplayNames
    ? new Intl.DisplayNames([code], { type: 'language' })
    : null;
}

let languageNames = getDisplayName('en');

getLanguage()
  .then((data) => {
    const names = getDisplayName(data.identifier);

    if (names) {
      languageNames = names;
    }
  })
  // The jQuery version had no failure handler either; `languageNames` just
  // stays on the English display names it was seeded with.
  .catch(() => {});

export default function getLanguageName(code: string) {
  if (!languageNames) {
    return code;
  }

  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
}
