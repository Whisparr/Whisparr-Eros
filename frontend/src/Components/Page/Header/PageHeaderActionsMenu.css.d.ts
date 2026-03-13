declare namespace PageHeaderActionsMenuCssNamespace {
  export interface IPageHeaderActionsMenuCss {
    itemIcon: string;
    menuButton: string;
  }
}

declare const PageHeaderActionsMenuCssModule: PageHeaderActionsMenuCssNamespace.IPageHeaderActionsMenuCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageHeaderActionsMenuCssNamespace.IPageHeaderActionsMenuCss;
};

export = PageHeaderActionsMenuCssModule;
