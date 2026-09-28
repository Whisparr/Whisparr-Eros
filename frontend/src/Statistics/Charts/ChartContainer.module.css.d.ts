declare namespace ChartContainerModuleCssNamespace {
  export interface IChartContainerModuleCss {
    chart: string;
    container: string;
    title: string;
  }
}

declare const ChartContainerModuleCssModule: ChartContainerModuleCssNamespace.IChartContainerModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ChartContainerModuleCssNamespace.IChartContainerModuleCss;
};

export = ChartContainerModuleCssModule;
