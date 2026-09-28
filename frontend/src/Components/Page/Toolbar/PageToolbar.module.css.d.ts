declare namespace PageToolbarModuleCssNamespace {
  export interface IPageToolbarModuleCss {
    toolbar: string;
  }
}

declare const PageToolbarModuleCssModule: PageToolbarModuleCssNamespace.IPageToolbarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarModuleCssNamespace.IPageToolbarModuleCss;
};

export = PageToolbarModuleCssModule;
