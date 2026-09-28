declare namespace DayOfWeekModuleCssNamespace {
  export interface IDayOfWeekModuleCss {
    dayOfWeek: string;
    isSingleDay: string;
    isToday: string;
  }
}

declare const DayOfWeekModuleCssModule: DayOfWeekModuleCssNamespace.IDayOfWeekModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DayOfWeekModuleCssNamespace.IDayOfWeekModuleCss;
};

export = DayOfWeekModuleCssModule;
