declare namespace DaysOfWeekModuleCssNamespace {
  export interface IDaysOfWeekModuleCss {
    daysOfWeek: string;
  }
}

declare const DaysOfWeekModuleCssModule: DaysOfWeekModuleCssNamespace.IDaysOfWeekModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DaysOfWeekModuleCssNamespace.IDaysOfWeekModuleCss;
};

export = DaysOfWeekModuleCssModule;
