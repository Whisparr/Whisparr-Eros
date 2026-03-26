declare namespace SelectMovieModalContentCssNamespace {
  export interface ISelectMovieModalContentCss {
    buttons: string;
    filterInput: string;
    footer: string;
    modalBody: string;
    path: string;
    scroller: string;
  }
}

declare const SelectMovieModalContentCssModule: SelectMovieModalContentCssNamespace.ISelectMovieModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectMovieModalContentCssNamespace.ISelectMovieModalContentCss;
};

export = SelectMovieModalContentCssModule;
