declare namespace SelectMovieModalContentModuleCssNamespace {
  export interface ISelectMovieModalContentModuleCss {
    buttons: string;
    filterInput: string;
    footer: string;
    modalBody: string;
    path: string;
    scroller: string;
  }
}

declare const SelectMovieModalContentModuleCssModule: SelectMovieModalContentModuleCssNamespace.ISelectMovieModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectMovieModalContentModuleCssNamespace.ISelectMovieModalContentModuleCss;
};

export = SelectMovieModalContentModuleCssModule;
