declare namespace PageToolbarButtonCssNamespace {
  export interface IPageToolbarButtonCss {
    isDisabled: string;
    label: string;
    labelContainer: string;
    toolbarButton: string;
  }
}

declare const PageToolbarButtonCssModule: PageToolbarButtonCssNamespace.IPageToolbarButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PageToolbarButtonCssNamespace.IPageToolbarButtonCss;
};

export = PageToolbarButtonCssModule;
