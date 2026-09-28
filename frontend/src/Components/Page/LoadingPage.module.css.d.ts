declare namespace LoadingPageModuleCssNamespace {
  export interface ILoadingPageModuleCss {
    logoFull: string;
    page: string;
  }
}

declare const LoadingPageModuleCssModule: LoadingPageModuleCssNamespace.ILoadingPageModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LoadingPageModuleCssNamespace.ILoadingPageModuleCss;
};

export = LoadingPageModuleCssModule;
