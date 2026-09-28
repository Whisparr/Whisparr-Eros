declare namespace MenuItemModuleCssNamespace {
  export interface IMenuItemModuleCss {
    isDisabled: string;
    menuItem: string;
  }
}

declare const MenuItemModuleCssModule: MenuItemModuleCssNamespace.IMenuItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuItemModuleCssNamespace.IMenuItemModuleCss;
};

export = MenuItemModuleCssModule;
