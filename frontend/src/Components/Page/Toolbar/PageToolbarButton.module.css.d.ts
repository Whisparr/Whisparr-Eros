declare namespace PageToolbarButtonModuleCssNamespace {
  export interface IPageToolbarButtonModuleCss {
    isDisabled: string;
    label: string;
    labelContainer: string;
    toolbarButton: string;
  }
}

declare const PageToolbarButtonModuleCssModule: PageToolbarButtonModuleCssNamespace.IPageToolbarButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarButtonModuleCssNamespace.IPageToolbarButtonModuleCss;
};

export = PageToolbarButtonModuleCssModule;
