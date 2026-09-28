declare namespace MenuItemSeparatorModuleCssNamespace {
  export interface IMenuItemSeparatorModuleCss {
    separator: string;
  }
}

declare const MenuItemSeparatorModuleCssModule: MenuItemSeparatorModuleCssNamespace.IMenuItemSeparatorModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuItemSeparatorModuleCssNamespace.IMenuItemSeparatorModuleCss;
};

export = MenuItemSeparatorModuleCssModule;
