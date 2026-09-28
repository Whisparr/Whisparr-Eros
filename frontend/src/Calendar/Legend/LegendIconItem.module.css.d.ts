declare namespace LegendIconItemModuleCssNamespace {
  export interface ILegendIconItemModuleCss {
    icon: string;
    legendIconItem: string;
  }
}

declare const LegendIconItemModuleCssModule: LegendIconItemModuleCssNamespace.ILegendIconItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LegendIconItemModuleCssNamespace.ILegendIconItemModuleCss;
};

export = LegendIconItemModuleCssModule;
