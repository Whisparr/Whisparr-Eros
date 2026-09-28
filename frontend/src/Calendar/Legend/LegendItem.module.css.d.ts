declare namespace LegendItemModuleCssNamespace {
  export interface ILegendItemModuleCss {
    continuing: string;
    downloaded: string;
    legendItem: string;
    missingMonitored: string;
    missingUnmonitored: string;
    queue: string;
    unmonitored: string;
  }
}

declare const LegendItemModuleCssModule: LegendItemModuleCssNamespace.ILegendItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LegendItemModuleCssNamespace.ILegendItemModuleCss;
};

export = LegendItemModuleCssModule;
