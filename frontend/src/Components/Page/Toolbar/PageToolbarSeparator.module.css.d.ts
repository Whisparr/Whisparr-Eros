declare namespace PageToolbarSeparatorModuleCssNamespace {
  export interface IPageToolbarSeparatorModuleCss {
    separator: string;
  }
}

declare const PageToolbarSeparatorModuleCssModule: PageToolbarSeparatorModuleCssNamespace.IPageToolbarSeparatorModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarSeparatorModuleCssNamespace.IPageToolbarSeparatorModuleCss;
};

export = PageToolbarSeparatorModuleCssModule;
