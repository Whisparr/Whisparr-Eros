declare namespace LegendIconItemCssNamespace {
  export interface ILegendIconItemCss {
    icon: string;
    legendIconItem: string;
  }
}

declare const LegendIconItemCssModule: LegendIconItemCssNamespace.ILegendIconItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LegendIconItemCssNamespace.ILegendIconItemCss;
};

export = LegendIconItemCssModule;
