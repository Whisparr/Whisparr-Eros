declare namespace ErrorPageModuleCssNamespace {
  export interface IErrorPageModuleCss {
    page: string;
    version: string;
  }
}

declare const ErrorPageModuleCssModule: ErrorPageModuleCssNamespace.IErrorPageModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ErrorPageModuleCssNamespace.IErrorPageModuleCss;
};

export = ErrorPageModuleCssModule;
