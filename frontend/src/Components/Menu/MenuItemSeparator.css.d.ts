declare namespace MenuItemSeparatorCssNamespace {
  export interface IMenuItemSeparatorCss {
    separator: string;
  }
}

declare const MenuItemSeparatorCssModule: MenuItemSeparatorCssNamespace.IMenuItemSeparatorCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuItemSeparatorCssNamespace.IMenuItemSeparatorCss;
};

export = MenuItemSeparatorCssModule;
