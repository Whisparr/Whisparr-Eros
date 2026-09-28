declare namespace TooltipModuleCssNamespace {
  export interface ITooltipModuleCss {
    arrow: string;
    arrowDisabled: string;
    body: string;
    bottom: string;
    default: string;
    horizontalContainer: string;
    inverse: string;
    left: string;
    reference: string;
    right: string;
    tooltip: string;
    tooltipContainer: string;
    top: string;
    verticalContainer: string;
  }
}

declare const TooltipModuleCssModule: TooltipModuleCssNamespace.ITooltipModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TooltipModuleCssNamespace.ITooltipModuleCss;
};

export = TooltipModuleCssModule;
