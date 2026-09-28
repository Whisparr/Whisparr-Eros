declare namespace LegendModuleCssNamespace {
  export interface ILegendModuleCss {
    legend: string;
  }
}

declare const LegendModuleCssModule: LegendModuleCssNamespace.ILegendModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LegendModuleCssNamespace.ILegendModuleCss;
};

export = LegendModuleCssModule;
