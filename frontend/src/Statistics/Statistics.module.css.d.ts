declare namespace StatisticsModuleCssNamespace {
  export interface IStatisticsModuleCss {
    chart: string;
    charts: string;
  }
}

declare const StatisticsModuleCssModule: StatisticsModuleCssNamespace.IStatisticsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StatisticsModuleCssNamespace.IStatisticsModuleCss;
};

export = StatisticsModuleCssModule;
