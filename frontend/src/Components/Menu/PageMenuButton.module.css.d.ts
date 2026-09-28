declare namespace PageMenuButtonModuleCssNamespace {
  export interface IPageMenuButtonModuleCss {
    indicatorContainer: string;
    label: string;
    menuButton: string;
  }
}

declare const PageMenuButtonModuleCssModule: PageMenuButtonModuleCssNamespace.IPageMenuButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageMenuButtonModuleCssNamespace.IPageMenuButtonModuleCss;
};

export = PageMenuButtonModuleCssModule;
