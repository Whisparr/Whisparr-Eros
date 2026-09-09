declare namespace StatusIndicatorCssNamespace {
  export interface IStatusIndicatorCss {
    label: string;
    status: string;
  }
}

declare const StatusIndicatorCssModule: StatusIndicatorCssNamespace.IStatusIndicatorCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StatusIndicatorCssNamespace.IStatusIndicatorCss;
};

export = StatusIndicatorCssModule;
