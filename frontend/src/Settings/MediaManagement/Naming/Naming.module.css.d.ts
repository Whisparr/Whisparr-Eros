declare namespace NamingModuleCssNamespace {
  export interface INamingModuleCss {
    namingInput: string;
  }
}

declare const NamingModuleCssModule: NamingModuleCssNamespace.INamingModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NamingModuleCssNamespace.INamingModuleCss;
};

export = NamingModuleCssModule;
