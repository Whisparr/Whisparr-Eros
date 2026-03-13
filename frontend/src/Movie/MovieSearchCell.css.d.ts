declare namespace MovieSearchCellCssNamespace {
  export interface IMovieSearchCellCss {
    movieSearchCell: string;
  }
}

declare const MovieSearchCellCssModule: MovieSearchCellCssNamespace.IMovieSearchCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieSearchCellCssNamespace.IMovieSearchCellCss;
};

export = MovieSearchCellCssModule;
