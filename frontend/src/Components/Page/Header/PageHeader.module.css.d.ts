declare namespace PageHeaderModuleCssNamespace {
  export interface IPageHeaderModuleCss {
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

declare const PageHeaderModuleCssModule: PageHeaderModuleCssNamespace.IPageHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageHeaderModuleCssNamespace.IPageHeaderModuleCss;
};

export = PageHeaderModuleCssModule;
