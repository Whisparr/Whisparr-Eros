declare namespace NamingCssNamespace {
  export interface INamingCss {
    namingInput: string;
  }
}

declare const NamingCssModule: NamingCssNamespace.INamingCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NamingCssNamespace.INamingCss;
};

export = NamingCssModule;
