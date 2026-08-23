import { useEffect, useState } from 'react';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import themes from 'Styles/Themes';

const useTheme = () => {
  // `theme` is undefined until `/config/ui` resolves, and the server hands the
  // page its own copy in `window.Whisparr.theme` for exactly that window.
  const selectedTheme = useUiSettingsValues().theme || window.Whisparr.theme;
  const [resolvedTheme, setResolvedTheme] = useState(selectedTheme);

  useEffect(() => {
    if (selectedTheme !== 'auto') {
      setResolvedTheme(selectedTheme);
      return;
    }

    const applySystemTheme = () => {
      setResolvedTheme(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      );
    };

    applySystemTheme();

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', applySystemTheme);

    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', applySystemTheme);
    };
  }, [selectedTheme]);

  return resolvedTheme;
};

export default useTheme;

export const useThemeColor = (color: string) => {
  const theme = useTheme();
  const themeVariables = themes[theme];

  // @ts-expect-error - themeVariables is a string indexable type
  return themeVariables[color];
};
