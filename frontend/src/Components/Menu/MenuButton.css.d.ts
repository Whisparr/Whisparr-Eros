declare namespace MenuButtonCssNamespace {
  export interface IMenuButtonCss {
    isDisabled: string;
    menuButton: string;
  }
}

declare const MenuButtonCssModule: MenuButtonCssNamespace.IMenuButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuButtonCssNamespace.IMenuButtonCss;
};

export = MenuButtonCssModule;
