declare namespace PageSidebarCssNamespace {
  export interface IPageSidebarCss {
    logo: string;
    logoContainer: string;
    logoLink: string;
    sidebar: string;
    sidebarCloseButton: string;
    sidebarContainer: string;
    sidebarHeader: string;
  }
}

declare const PageSidebarCssModule: PageSidebarCssNamespace.IPageSidebarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageSidebarCssNamespace.IPageSidebarCss;
};

export = PageSidebarCssModule;
