declare namespace ExtraFileRowCssNamespace {
  export interface IExtraFileRowCss {
    extension: string;
    relativePath: string;
    type: string;
  }
}

declare const ExtraFileRowCssModule: ExtraFileRowCssNamespace.IExtraFileRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ExtraFileRowCssNamespace.IExtraFileRowCss;
};

export = ExtraFileRowCssModule;
