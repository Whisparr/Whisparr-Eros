declare namespace MovieIndexTableCssNamespace {
  export interface IMovieIndexTableCss {
    row: string;
    tableScroller: string;
  }
}

declare const MovieIndexTableCssModule: MovieIndexTableCssNamespace.IMovieIndexTableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexTableCssNamespace.IMovieIndexTableCss;
};

export = MovieIndexTableCssModule;
