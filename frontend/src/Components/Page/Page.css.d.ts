declare namespace PageCssNamespace {
  export interface IPageCss {
    main: string;
    page: string;
  }
}

declare const PageCssModule: PageCssNamespace.IPageCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageCssNamespace.IPageCss;
};

export = PageCssModule;
