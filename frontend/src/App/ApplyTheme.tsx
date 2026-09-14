import { useCallback, useEffect } from 'react';
import useTheme from 'Helpers/Hooks/useTheme';
import themes from 'Styles/Themes';

function ApplyTheme() {
  // `useTheme` resolves `auto` against the system theme and follows it when it
  // changes; `themes.auto` is fixed at page load, so reading it here would not.
  const theme = useTheme();

  const updateCSSVariables = useCallback(() => {
    Object.entries(themes[theme]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, [theme]);

  // On Component Mount and Component Update
  useEffect(() => {
    updateCSSVariables();
  }, [updateCSSVariables, theme]);

  return null;
}

export default ApplyTheme;
