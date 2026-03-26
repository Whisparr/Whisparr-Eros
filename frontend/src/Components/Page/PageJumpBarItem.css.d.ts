declare namespace PageJumpBarItemCssNamespace {
  export interface IPageJumpBarItemCss {
    jumpBarItem: string;
  }
}

declare const PageJumpBarItemCssModule: PageJumpBarItemCssNamespace.IPageJumpBarItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageJumpBarItemCssNamespace.IPageJumpBarItemCss;
};

export = PageJumpBarItemCssModule;
