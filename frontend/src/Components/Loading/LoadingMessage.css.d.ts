declare namespace LoadingMessageCssNamespace {
  export interface ILoadingMessageCss {
    loadingMessage: string;
  }
}

declare const LoadingMessageCssModule: LoadingMessageCssNamespace.ILoadingMessageCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LoadingMessageCssNamespace.ILoadingMessageCss;
};

export = LoadingMessageCssModule;
