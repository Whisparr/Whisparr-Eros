declare namespace PageContentErrorModuleCssNamespace {
  export interface IPageContentErrorModuleCss {
    content: string;
  }
}

declare const PageContentErrorModuleCssModule: PageContentErrorModuleCssNamespace.IPageContentErrorModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageContentErrorModuleCssNamespace.IPageContentErrorModuleCss;
};

export = PageContentErrorModuleCssModule;
