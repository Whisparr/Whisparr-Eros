declare namespace PageMenuButtonCssNamespace {
  export interface IPageMenuButtonCss {
    indicatorContainer: string;
    label: string;
    menuButton: string;
  }
}

declare const PageMenuButtonCssModule: PageMenuButtonCssNamespace.IPageMenuButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageMenuButtonCssNamespace.IPageMenuButtonCss;
};

export = PageMenuButtonCssModule;
