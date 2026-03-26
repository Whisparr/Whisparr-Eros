declare namespace PageContentFooterCssNamespace {
  export interface IPageContentFooterCss {
    contentFooter: string;
  }
}

declare const PageContentFooterCssModule: PageContentFooterCssNamespace.IPageContentFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageContentFooterCssNamespace.IPageContentFooterCss;
};

export = PageContentFooterCssModule;
