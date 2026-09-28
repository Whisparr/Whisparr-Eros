declare namespace NotFoundModuleCssNamespace {
  export interface INotFoundModuleCss {
    container: string;
    image: string;
    message: string;
  }
}

declare const NotFoundModuleCssModule: NotFoundModuleCssNamespace.INotFoundModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NotFoundModuleCssNamespace.INotFoundModuleCss;
};

export = NotFoundModuleCssModule;
