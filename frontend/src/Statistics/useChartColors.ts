import { useMemo } from 'react';
import { useThemeColor } from 'Helpers/Hooks/useTheme';

export interface ChartColors {
  text: string;
  grid: string;
  bar: string;
  palette: string[];
  successColor: string;
  dangerColor: string;
  warningColor: string;
  grayColor: string;
}

// Our theme is branded around purple and pink rather than Sonarr's blue, so the
// palette starts from themePurple and works through the shared status colours.
const useChartColors = (): ChartColors => {
  const textColor = useThemeColor('textColor');
  const darkGray = useThemeColor('darkGray');
  const gray = useThemeColor('gray');
  const themePurple = useThemeColor('themePurple');
  const themeAlternatePurple = useThemeColor('themeAlternatePurple');
  const successColor = useThemeColor('successColor');
  const dangerColor = useThemeColor('dangerColor');
  const warningColor = useThemeColor('warningColor');
  const purple = useThemeColor('purple');
  const pink = useThemeColor('pink');

  return useMemo(() => {
    return {
      text: textColor,
      grid: `${darkGray}40`,
      bar: themePurple,
      palette: [
        themePurple,
        successColor,
        warningColor,
        dangerColor,
        purple,
        pink,
        themeAlternatePurple,
        gray,
      ],
      successColor,
      dangerColor,
      warningColor,
      grayColor: gray,
    };
  }, [
    textColor,
    darkGray,
    gray,
    themePurple,
    themeAlternatePurple,
    successColor,
    dangerColor,
    warningColor,
    purple,
    pink,
  ]);
};

export default useChartColors;
