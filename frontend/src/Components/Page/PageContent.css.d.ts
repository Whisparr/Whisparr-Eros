declare namespace PageContentCssNamespace {
  export interface IPageContentCss {
    content: string;
  }
}

declare const PageContentCssModule: PageContentCssNamespace.IPageContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageContentCssNamespace.IPageContentCss;
};

export = PageContentCssModule;
