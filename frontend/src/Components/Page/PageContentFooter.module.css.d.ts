declare namespace PageContentFooterModuleCssNamespace {
  export interface IPageContentFooterModuleCss {
    contentFooter: string;
  }
}

declare const PageContentFooterModuleCssModule: PageContentFooterModuleCssNamespace.IPageContentFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageContentFooterModuleCssNamespace.IPageContentFooterModuleCss;
};

export = PageContentFooterModuleCssModule;
