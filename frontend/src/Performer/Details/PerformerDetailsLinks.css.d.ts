declare namespace PerformerDetailsLinksCssNamespace {
  export interface IPerformerDetailsLinksCss {
    link: string;
    linkLabel: string;
    links: string;
  }
}

declare const PerformerDetailsLinksCssModule: PerformerDetailsLinksCssNamespace.IPerformerDetailsLinksCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerDetailsLinksCssNamespace.IPerformerDetailsLinksCss;
};

export = PerformerDetailsLinksCssModule;
