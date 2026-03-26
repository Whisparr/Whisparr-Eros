declare namespace MenuItemCssNamespace {
  export interface IMenuItemCss {
    isDisabled: string;
    menuItem: string;
  }
}

declare const MenuItemCssModule: MenuItemCssNamespace.IMenuItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuItemCssNamespace.IMenuItemCss;
};

export = MenuItemCssModule;
