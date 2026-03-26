declare namespace DayOfWeekCssNamespace {
  export interface IDayOfWeekCss {
    dayOfWeek: string;
    isSingleDay: string;
    isToday: string;
  }
}

declare const DayOfWeekCssModule: DayOfWeekCssNamespace.IDayOfWeekCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DayOfWeekCssNamespace.IDayOfWeekCss;
};

export = DayOfWeekCssModule;
