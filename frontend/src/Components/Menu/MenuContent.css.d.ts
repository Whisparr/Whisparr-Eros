declare namespace MenuContentCssNamespace {
  export interface IMenuContentCss {
    menuContent: string;
    scroller: string;
  }
}

declare const MenuContentCssModule: MenuContentCssNamespace.IMenuContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MenuContentCssNamespace.IMenuContentCss;
};

export = MenuContentCssModule;
