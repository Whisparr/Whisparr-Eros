declare namespace LoadingPageCssNamespace {
  export interface ILoadingPageCss {
    logoFull: string;
    page: string;
  }
}

declare const LoadingPageCssModule: LoadingPageCssNamespace.ILoadingPageCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LoadingPageCssNamespace.ILoadingPageCss;
};

export = LoadingPageCssModule;
