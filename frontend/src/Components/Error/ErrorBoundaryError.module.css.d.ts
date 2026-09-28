declare namespace ErrorBoundaryErrorModuleCssNamespace {
  export interface IErrorBoundaryErrorModuleCss {
    container: string;
    details: string;
    image: string;
    imageContainer: string;
    message: string;
    version: string;
  }
}

declare const ErrorBoundaryErrorModuleCssModule: ErrorBoundaryErrorModuleCssNamespace.IErrorBoundaryErrorModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ErrorBoundaryErrorModuleCssNamespace.IErrorBoundaryErrorModuleCss;
};

export = ErrorBoundaryErrorModuleCssModule;
