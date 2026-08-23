import { useCallback, useEffect } from 'react';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import themes from 'Styles/Themes';

function ApplyTheme() {
  // Mounted above the boot gate, so this renders before `/config/ui` resolves
  // and falls back to the theme the server rendered the page with.
  const theme = useUiSettingsValues().theme || window.Whisparr.theme;

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
