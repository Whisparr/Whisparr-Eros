declare namespace PageJumpBarCssNamespace {
  export interface IPageJumpBarCss {
    jumpBar: string;
    jumpBarItems: string;
  }
}

declare const PageJumpBarCssModule: PageJumpBarCssNamespace.IPageJumpBarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageJumpBarCssNamespace.IPageJumpBarCss;
};

export = PageJumpBarCssModule;
