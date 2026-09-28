declare namespace MenuButtonModuleCssNamespace {
  export interface IMenuButtonModuleCss {
    isDisabled: string;
    menuButton: string;
  }
}

declare const MenuButtonModuleCssModule: MenuButtonModuleCssNamespace.IMenuButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuButtonModuleCssNamespace.IMenuButtonModuleCss;
};

export = MenuButtonModuleCssModule;
