declare namespace PageContentBodyCssNamespace {
  export interface IPageContentBodyCss {
    contentBody: string;
    innerContentBody: string;
  }
}

declare const PageContentBodyCssModule: PageContentBodyCssNamespace.IPageContentBodyCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageContentBodyCssNamespace.IPageContentBodyCss;
};

export = PageContentBodyCssModule;
