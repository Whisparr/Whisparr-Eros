declare namespace ExtraFileTableCssNamespace {
  export interface IExtraFileTableCss {
    container: string;
  }
}

declare const ExtraFileTableCssModule: ExtraFileTableCssNamespace.IExtraFileTableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ExtraFileTableCssNamespace.IExtraFileTableCss;
};

export = ExtraFileTableCssModule;
