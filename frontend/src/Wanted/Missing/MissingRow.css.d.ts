declare namespace MissingRowCssNamespace {
  export interface IMissingRowCss {
    status: string;
  }
}

declare const MissingRowCssModule: MissingRowCssNamespace.IMissingRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MissingRowCssNamespace.IMissingRowCss;
};

export = MissingRowCssModule;
