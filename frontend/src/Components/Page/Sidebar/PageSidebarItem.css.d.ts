declare namespace PageSidebarItemCssNamespace {
  export interface IPageSidebarItemCss {
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

declare const PageSidebarItemCssModule: PageSidebarItemCssNamespace.IPageSidebarItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageSidebarItemCssNamespace.IPageSidebarItemCss;
};

export = PageSidebarItemCssModule;
