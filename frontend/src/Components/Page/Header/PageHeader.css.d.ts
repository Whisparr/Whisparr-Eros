declare namespace PageHeaderCssNamespace {
  export interface IPageHeaderCss {
    donate: string;
    header: string;
    logo: string;
    logoContainer: string;
    logoFull: string;
    logoLink: string;
    right: string;
    sidebarToggleContainer: string;
    translate: string;
  }
}

declare const PageHeaderCssModule: PageHeaderCssNamespace.IPageHeaderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageHeaderCssNamespace.IPageHeaderCss;
};

export = PageHeaderCssModule;
