declare namespace PageSidebarModuleCssNamespace {
  export interface IPageSidebarModuleCss {
    logo: string;
    logoContainer: string;
    logoLink: string;
    sidebar: string;
    sidebarCloseButton: string;
    sidebarContainer: string;
    sidebarHeader: string;
  }
}

declare const PageSidebarModuleCssModule: PageSidebarModuleCssNamespace.IPageSidebarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageSidebarModuleCssNamespace.IPageSidebarModuleCss;
};

export = PageSidebarModuleCssModule;
