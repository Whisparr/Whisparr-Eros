declare namespace LoadingIndicatorModuleCssNamespace {
  export interface ILoadingIndicatorModuleCss {
    loading: string;
    ripple: string;
    rippleContainer: string;
  }
}

declare const LoadingIndicatorModuleCssModule: LoadingIndicatorModuleCssNamespace.ILoadingIndicatorModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LoadingIndicatorModuleCssNamespace.ILoadingIndicatorModuleCss;
};

export = LoadingIndicatorModuleCssModule;
