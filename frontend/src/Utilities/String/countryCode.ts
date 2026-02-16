/* eslint-disable global-require */
import countries from 'i18n-iso-countries';

export default function countryCode(countryCode: string) {
  // i18n-iso-countries doesn't include typings, so we need to ignore the type error here.
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

  try {
    // Register the user's locale with i18n-iso-countries.
    // This is required to get the country name in the correct language.
    countries.registerLocale(
      // i18n-iso-countries uses language codes for its locale files,
      // so we need to extract the language code from the user's locale.
      // For example, if the user's locale is "en-US", we need to load "en.json".

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(`i18n-iso-countries/langs/${locale}.json`)
    );
  } catch (error) {
    console.error('Failed to register locale:', error);

    // If the locale isn't supported, fall back to English

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
  }

  // Get the country name for the given country code and user locale.
  return countries.getName(countryCode, locale) || countryCode;
}
