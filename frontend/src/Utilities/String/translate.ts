let translations: Record<string, string> = {};

// Filled by `App/useTranslations` as soon as the localization query resolves,
// before anything that waits on it renders.
export function setTranslations(strings: Record<string, string>) {
  translations = strings;
}

export default function translate(
  key: string,
  tokens: Record<string, string | number | boolean> = {}
) {
  const { isProduction = true } = window.Whisparr;

  if (!isProduction && !(key in translations)) {
    console.log(
      `%cMissing translation for key: ${key}`,
      'color: orange; font-weight: bold; background: #222; padding: 2px 4px; border-radius: 2px;'
    );
  }

  const translation = translations[key] || key;

  tokens.appName = 'Whisparr';

  // Fallback to the old behaviour for translations not yet updated to use named tokens
  Object.values(tokens).forEach((value, index) => {
    tokens[index] = value;
  });

  return translation.replace(/\{([a-z0-9]+?)\}/gi, (match, tokenMatch) =>
    String(tokens[tokenMatch] ?? match)
  );
}
