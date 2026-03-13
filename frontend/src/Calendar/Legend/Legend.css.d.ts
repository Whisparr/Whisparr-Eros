declare namespace LegendCssNamespace {
  export interface ILegendCss {
    legend: string;
  }
}

declare const LegendCssModule: LegendCssNamespace.ILegendCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LegendCssNamespace.ILegendCss;
};

export = LegendCssModule;
