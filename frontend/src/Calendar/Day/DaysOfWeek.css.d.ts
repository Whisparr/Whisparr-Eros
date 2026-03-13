declare namespace DaysOfWeekCssNamespace {
  export interface IDaysOfWeekCss {
    daysOfWeek: string;
  }
}

declare const DaysOfWeekCssModule: DaysOfWeekCssNamespace.IDaysOfWeekCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DaysOfWeekCssNamespace.IDaysOfWeekCss;
};

export = DaysOfWeekCssModule;
