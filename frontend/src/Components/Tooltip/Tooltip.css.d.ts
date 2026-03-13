declare namespace TooltipCssNamespace {
  export interface ITooltipCss {
    arrow: string;
    arrowDisabled: string;
    body: string;
    bottom: string;
    default: string;
    horizontalContainer: string;
    inverse: string;
    left: string;
    right: string;
    tooltip: string;
    tooltipContainer: string;
    top: string;
    verticalContainer: string;
  }
}

declare const TooltipCssModule: TooltipCssNamespace.ITooltipCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TooltipCssNamespace.ITooltipCss;
};

export = TooltipCssModule;
