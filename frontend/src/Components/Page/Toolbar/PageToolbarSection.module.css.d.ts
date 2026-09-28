declare namespace PageToolbarSectionModuleCssNamespace {
  export interface IPageToolbarSectionModuleCss {
    center: string;
    left: string;
    overflowMenuButton: string;
    overflowMenuItemIcon: string;
    right: string;
    section: string;
    sectionContainer: string;
  }
}

declare const PageToolbarSectionModuleCssModule: PageToolbarSectionModuleCssNamespace.IPageToolbarSectionModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarSectionModuleCssNamespace.IPageToolbarSectionModuleCss;
};

export = PageToolbarSectionModuleCssModule;
