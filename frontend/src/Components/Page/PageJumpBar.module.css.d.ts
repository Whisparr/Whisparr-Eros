declare namespace PageJumpBarModuleCssNamespace {
  export interface IPageJumpBarModuleCss {
    jumpBar: string;
    jumpBarItems: string;
  }
}

declare const PageJumpBarModuleCssModule: PageJumpBarModuleCssNamespace.IPageJumpBarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageJumpBarModuleCssNamespace.IPageJumpBarModuleCss;
};

export = PageJumpBarModuleCssModule;
