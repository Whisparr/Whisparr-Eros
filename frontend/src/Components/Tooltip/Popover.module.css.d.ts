declare namespace PopoverModuleCssNamespace {
  export interface IPopoverModuleCss {
    body: string;
    title: string;
    tooltipBody: string;
  }
}

declare const PopoverModuleCssModule: PopoverModuleCssNamespace.IPopoverModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PopoverModuleCssNamespace.IPopoverModuleCss;
};

export = PopoverModuleCssModule;
