declare namespace LegendItemCssNamespace {
  export interface ILegendItemCss {
    continuing: string;
    downloaded: string;
    legendItem: string;
    missingMonitored: string;
    missingUnmonitored: string;
    queue: string;
    unmonitored: string;
  }
}

declare const LegendItemCssModule: LegendItemCssNamespace.ILegendItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LegendItemCssNamespace.ILegendItemCss;
};

export = LegendItemCssModule;
