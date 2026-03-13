declare namespace LinkCssNamespace {
  export interface ILinkCss {
    link: string;
    to: string;
  }
}

declare const LinkCssModule: LinkCssNamespace.ILinkCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LinkCssNamespace.ILinkCss;
};

export = LinkCssModule;
