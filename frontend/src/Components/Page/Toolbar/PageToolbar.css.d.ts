declare namespace PageToolbarCssNamespace {
  export interface IPageToolbarCss {
    toolbar: string;
  }
}

declare const PageToolbarCssModule: PageToolbarCssNamespace.IPageToolbarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarCssNamespace.IPageToolbarCss;
};

export = PageToolbarCssModule;
