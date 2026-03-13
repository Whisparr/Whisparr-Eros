declare namespace PageContentErrorCssNamespace {
  export interface IPageContentErrorCss {
    content: string;
  }
}

declare const PageContentErrorCssModule: PageContentErrorCssNamespace.IPageContentErrorCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageContentErrorCssNamespace.IPageContentErrorCss;
};

export = PageContentErrorCssModule;
