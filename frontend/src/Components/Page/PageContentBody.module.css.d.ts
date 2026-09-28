declare namespace PageContentBodyModuleCssNamespace {
  export interface IPageContentBodyModuleCss {
    contentBody: string;
    innerContentBody: string;
  }
}

declare const PageContentBodyModuleCssModule: PageContentBodyModuleCssNamespace.IPageContentBodyModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageContentBodyModuleCssNamespace.IPageContentBodyModuleCss;
};

export = PageContentBodyModuleCssModule;
