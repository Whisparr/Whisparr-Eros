declare namespace MenuContentModuleCssNamespace {
  export interface IMenuContentModuleCss {
    menuContent: string;
    scroller: string;
  }
}

declare const MenuContentModuleCssModule: MenuContentModuleCssNamespace.IMenuContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuContentModuleCssNamespace.IMenuContentModuleCss;
};

export = MenuContentModuleCssModule;
