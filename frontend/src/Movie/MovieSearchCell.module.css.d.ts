declare namespace MovieSearchCellModuleCssNamespace {
  export interface IMovieSearchCellModuleCss {
    movieSearchCell: string;
  }
}

declare const MovieSearchCellModuleCssModule: MovieSearchCellModuleCssNamespace.IMovieSearchCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieSearchCellModuleCssNamespace.IMovieSearchCellModuleCss;
};

export = MovieSearchCellModuleCssModule;
