declare namespace PageJumpBarItemModuleCssNamespace {
  export interface IPageJumpBarItemModuleCss {
    jumpBarItem: string;
  }
}

declare const PageJumpBarItemModuleCssModule: PageJumpBarItemModuleCssNamespace.IPageJumpBarItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageJumpBarItemModuleCssNamespace.IPageJumpBarItemModuleCss;
};

export = PageJumpBarItemModuleCssModule;
