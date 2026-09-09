declare namespace ChartContainerCssNamespace {
  export interface IChartContainerCss {
    chart: string;
    container: string;
    title: string;
  }
}

declare const ChartContainerCssModule: ChartContainerCssNamespace.IChartContainerCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ChartContainerCssNamespace.IChartContainerCss;
};

export = ChartContainerCssModule;
