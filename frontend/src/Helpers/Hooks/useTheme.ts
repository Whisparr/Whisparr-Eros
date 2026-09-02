import { useEffect, useState } from 'react';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import themes from 'Styles/Themes';

const systemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const useTheme = (): 'dark' | 'light' => {
  // `theme` is undefined until `/config/ui` resolves, and the server hands the
  // page its own copy in `window.Whisparr.theme` for exactly that window.
  const selectedTheme = useUiSettingsValues().theme || window.Whisparr.theme;

  // Resolve `auto` here rather than leaving it to the effect: the effect runs
  // after the first paint, so anything reading the theme during that render --
  // `useThemeColor` indexes `themes` by it -- got `auto`, which is not a theme.
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    selectedTheme === 'auto' ? systemTheme() : selectedTheme
  );

  useEffect(() => {
    if (selectedTheme !== 'auto') {
      setResolvedTheme(selectedTheme);
      return;
    }

    const applySystemTheme = () => {
      setResolvedTheme(systemTheme());
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
