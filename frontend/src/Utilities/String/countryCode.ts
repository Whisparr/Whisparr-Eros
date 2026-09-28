import countries, { LocaleData } from 'i18n-iso-countries';

// Every locale file is bundled up front, as webpack's require context did, so
// the lookup below can stay synchronous.
const LOCALES = import.meta.glob<LocaleData>(
  '/node_modules/i18n-iso-countries/langs/*.json',
  { eager: true, import: 'default' }
);

function getLocaleData(locale: string) {
  return LOCALES[`/node_modules/i18n-iso-countries/langs/${locale}.json`];
}

export default function countryCode(countryCode: string) {
  const userLocale =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    'en';

  // If the country code is invalid or empty, return it as is.
  if (!userLocale) {
    return countryCode;
  }
  const locale =
    userLocale.indexOf('-') > 0 ? userLocale.split('-')[0] : userLocale;

  // Register the user's locale with i18n-iso-countries, which names its
  // locale files by language code: "en-US" loads en.json. An unsupported
  // locale falls back to English.
  countries.registerLocale(getLocaleData(locale) ?? getLocaleData('en'));

  // Get the country name for the given country code and user locale.
  return countries.getName(countryCode, locale) || countryCode;
}
