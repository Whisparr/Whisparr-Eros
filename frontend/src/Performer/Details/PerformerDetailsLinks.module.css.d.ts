declare namespace PerformerDetailsLinksModuleCssNamespace {
  export interface IPerformerDetailsLinksModuleCss {
    link: string;
    linkLabel: string;
    links: string;
  }
}

declare const PerformerDetailsLinksModuleCssModule: PerformerDetailsLinksModuleCssNamespace.IPerformerDetailsLinksModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerDetailsLinksModuleCssNamespace.IPerformerDetailsLinksModuleCss;
};

export = PerformerDetailsLinksModuleCssModule;
