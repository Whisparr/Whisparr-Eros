declare namespace NamingModalCssNamespace {
  export interface INamingModalCss {
    footNote: string;
    groups: string;
    icon: string;
    namingSelect: string;
    namingSelectContainer: string;
  }
}

declare const NamingModalCssModule: NamingModalCssNamespace.INamingModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NamingModalCssNamespace.INamingModalCss;
};

export = NamingModalCssModule;
