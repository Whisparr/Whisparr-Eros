declare namespace StatisticsSummaryModuleCssNamespace {
  export interface IStatisticsSummaryModuleCss {
    label: string;
    summary: string;
    tile: string;
    value: string;
  }
}

declare const StatisticsSummaryModuleCssModule: StatisticsSummaryModuleCssNamespace.IStatisticsSummaryModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StatisticsSummaryModuleCssNamespace.IStatisticsSummaryModuleCss;
};

export = StatisticsSummaryModuleCssModule;
