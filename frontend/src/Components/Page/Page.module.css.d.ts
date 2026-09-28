declare namespace PageModuleCssNamespace {
  export interface IPageModuleCss {
    main: string;
    page: string;
  }
}

declare const PageModuleCssModule: PageModuleCssNamespace.IPageModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageModuleCssNamespace.IPageModuleCss;
};

export = PageModuleCssModule;
