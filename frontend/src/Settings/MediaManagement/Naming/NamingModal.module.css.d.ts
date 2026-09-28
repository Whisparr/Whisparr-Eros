declare namespace NamingModalModuleCssNamespace {
  export interface INamingModalModuleCss {
    footNote: string;
    groups: string;
    icon: string;
    namingSelect: string;
    namingSelectContainer: string;
  }
}

declare const NamingModalModuleCssModule: NamingModalModuleCssNamespace.INamingModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NamingModalModuleCssNamespace.INamingModalModuleCss;
};

export = NamingModalModuleCssModule;
