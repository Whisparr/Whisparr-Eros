declare namespace LinkModuleCssNamespace {
  export interface ILinkModuleCss {
    link: string;
    to: string;
  }
}

declare const LinkModuleCssModule: LinkModuleCssNamespace.ILinkModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LinkModuleCssNamespace.ILinkModuleCss;
};

export = LinkModuleCssModule;
