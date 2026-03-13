declare namespace ErrorBoundaryErrorCssNamespace {
  export interface IErrorBoundaryErrorCss {
    container: string;
    details: string;
    image: string;
    imageContainer: string;
    message: string;
    version: string;
  }
}

declare const ErrorBoundaryErrorCssModule: ErrorBoundaryErrorCssNamespace.IErrorBoundaryErrorCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ErrorBoundaryErrorCssNamespace.IErrorBoundaryErrorCss;
};

export = ErrorBoundaryErrorCssModule;
