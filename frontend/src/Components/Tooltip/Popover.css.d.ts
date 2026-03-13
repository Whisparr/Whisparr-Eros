declare namespace PopoverCssNamespace {
  export interface IPopoverCss {
    body: string;
    title: string;
    tooltipBody: string;
  }
}

declare const PopoverCssModule: PopoverCssNamespace.IPopoverCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PopoverCssNamespace.IPopoverCss;
};

export = PopoverCssModule;
