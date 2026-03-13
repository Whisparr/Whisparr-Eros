declare namespace PageToolbarSeparatorCssNamespace {
  export interface IPageToolbarSeparatorCss {
    separator: string;
  }
}

declare const PageToolbarSeparatorCssModule: PageToolbarSeparatorCssNamespace.IPageToolbarSeparatorCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarSeparatorCssNamespace.IPageToolbarSeparatorCss;
};

export = PageToolbarSeparatorCssModule;
