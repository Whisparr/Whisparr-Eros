declare namespace MissingRowModuleCssNamespace {
  export interface IMissingRowModuleCss {
    status: string;
  }
}

declare const MissingRowModuleCssModule: MissingRowModuleCssNamespace.IMissingRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MissingRowModuleCssNamespace.IMissingRowModuleCss;
};

export = MissingRowModuleCssModule;
