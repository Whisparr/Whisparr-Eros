declare namespace PageToolbarSectionCssNamespace {
  export interface IPageToolbarSectionCss {
    center: string;
    left: string;
    overflowMenuButton: string;
    overflowMenuItemIcon: string;
    right: string;
    section: string;
    sectionContainer: string;
  }
}

declare const PageToolbarSectionCssModule: PageToolbarSectionCssNamespace.IPageToolbarSectionCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarSectionCssNamespace.IPageToolbarSectionCss;
};

export = PageToolbarSectionCssModule;
