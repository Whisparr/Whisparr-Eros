declare namespace MenuCssNamespace {
  export interface IMenuCss {
    menu: string;
  }
}

declare const MenuCssModule: MenuCssNamespace.IMenuCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuCssNamespace.IMenuCss;
};

export = MenuCssModule;
