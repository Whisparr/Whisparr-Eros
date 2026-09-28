declare namespace ExtraFileRowModuleCssNamespace {
  export interface IExtraFileRowModuleCss {
    extension: string;
    relativePath: string;
    type: string;
  }
}

declare const ExtraFileRowModuleCssModule: ExtraFileRowModuleCssNamespace.IExtraFileRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ExtraFileRowModuleCssNamespace.IExtraFileRowModuleCss;
};

export = ExtraFileRowModuleCssModule;
