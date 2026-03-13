declare namespace ErrorPageCssNamespace {
  export interface IErrorPageCss {
    page: string;
    version: string;
  }
}

declare const ErrorPageCssModule: ErrorPageCssNamespace.IErrorPageCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ErrorPageCssNamespace.IErrorPageCss;
};

export = ErrorPageCssModule;
