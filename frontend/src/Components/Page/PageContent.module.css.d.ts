declare namespace PageContentModuleCssNamespace {
  export interface IPageContentModuleCss {
    content: string;
  }
}

declare const PageContentModuleCssModule: PageContentModuleCssNamespace.IPageContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageContentModuleCssNamespace.IPageContentModuleCss;
};

export = PageContentModuleCssModule;
