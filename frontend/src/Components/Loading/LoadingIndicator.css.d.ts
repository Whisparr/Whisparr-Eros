declare namespace LoadingIndicatorCssNamespace {
  export interface ILoadingIndicatorCss {
    loading: string;
    ripple: string;
    rippleContainer: string;
  }
}

declare const LoadingIndicatorCssModule: LoadingIndicatorCssNamespace.ILoadingIndicatorCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LoadingIndicatorCssNamespace.ILoadingIndicatorCss;
};

export = LoadingIndicatorCssModule;
