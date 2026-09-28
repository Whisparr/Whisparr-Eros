declare namespace PageHeaderActionsMenuModuleCssNamespace {
  export interface IPageHeaderActionsMenuModuleCss {
    itemIcon: string;
    menuButton: string;
  }
}

declare const PageHeaderActionsMenuModuleCssModule: PageHeaderActionsMenuModuleCssNamespace.IPageHeaderActionsMenuModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageHeaderActionsMenuModuleCssNamespace.IPageHeaderActionsMenuModuleCss;
};

export = PageHeaderActionsMenuModuleCssModule;
