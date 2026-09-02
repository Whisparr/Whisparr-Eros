declare namespace StatisticsCssNamespace {
  export interface IStatisticsCss {
    chart: string;
    charts: string;
  }
}

declare const StatisticsCssModule: StatisticsCssNamespace.IStatisticsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StatisticsCssNamespace.IStatisticsCss;
};

export = StatisticsCssModule;
