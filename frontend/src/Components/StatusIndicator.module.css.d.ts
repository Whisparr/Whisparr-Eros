declare namespace StatusIndicatorModuleCssNamespace {
  export interface IStatusIndicatorModuleCss {
    label: string;
    status: string;
  }
}

declare const StatusIndicatorModuleCssModule: StatusIndicatorModuleCssNamespace.IStatusIndicatorModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StatusIndicatorModuleCssNamespace.IStatusIndicatorModuleCss;
};

export = StatusIndicatorModuleCssModule;
