declare namespace StatisticsSummaryCssNamespace {
  export interface IStatisticsSummaryCss {
    label: string;
    summary: string;
    tile: string;
    value: string;
  }
}

declare const StatisticsSummaryCssModule: StatisticsSummaryCssNamespace.IStatisticsSummaryCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StatisticsSummaryCssNamespace.IStatisticsSummaryCss;
};

export = StatisticsSummaryCssModule;
