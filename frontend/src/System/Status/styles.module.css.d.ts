declare namespace StylesModuleCssNamespace {
  export interface IStylesModuleCss {
    logo: string;
    logoContainer: string;
  }
}

declare const StylesModuleCssModule: StylesModuleCssNamespace.IStylesModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesModuleCssNamespace.IStylesModuleCss;
};

export = StylesModuleCssModule;
