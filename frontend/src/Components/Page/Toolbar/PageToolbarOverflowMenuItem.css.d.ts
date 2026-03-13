declare namespace PageToolbarOverflowMenuItemCssNamespace {
  export interface IPageToolbarOverflowMenuItemCss {
    icon: string;
  }
}

declare const PageToolbarOverflowMenuItemCssModule: PageToolbarOverflowMenuItemCssNamespace.IPageToolbarOverflowMenuItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarOverflowMenuItemCssNamespace.IPageToolbarOverflowMenuItemCss;
};

export = PageToolbarOverflowMenuItemCssModule;
