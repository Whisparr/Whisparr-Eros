declare namespace NamingOptionCssNamespace {
  export interface INamingOptionCss {
    example: string;
    footNote: string;
    isFullFilename: string;
    large: string;
    lower: string;
    option: string;
    small: string;
    title: string;
    token: string;
    upper: string;
  }
}

declare const NamingOptionCssModule: NamingOptionCssNamespace.INamingOptionCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NamingOptionCssNamespace.INamingOptionCss;
};

export = NamingOptionCssModule;
