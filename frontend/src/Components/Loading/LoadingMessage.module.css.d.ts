declare namespace LoadingMessageModuleCssNamespace {
  export interface ILoadingMessageModuleCss {
    loadingMessage: string;
  }
}

declare const LoadingMessageModuleCssModule: LoadingMessageModuleCssNamespace.ILoadingMessageModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LoadingMessageModuleCssNamespace.ILoadingMessageModuleCss;
};

export = LoadingMessageModuleCssModule;
