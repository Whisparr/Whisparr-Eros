declare namespace PageSidebarItemModuleCssNamespace {
  export interface IPageSidebarItemModuleCss {
    childLink: string;
    iconContainer: string;
    isActiveItem: string;
    isActiveLink: string;
    isActiveParentLink: string;
    item: string;
    link: string;
    sectionHeading: string;
    status: string;
  }
}

declare const PageSidebarItemModuleCssModule: PageSidebarItemModuleCssNamespace.IPageSidebarItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageSidebarItemModuleCssNamespace.IPageSidebarItemModuleCss;
};

export = PageSidebarItemModuleCssModule;
