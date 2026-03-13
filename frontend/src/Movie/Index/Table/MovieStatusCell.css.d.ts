declare namespace MovieStatusCellCssNamespace {
  export interface IMovieStatusCellCss {
    status: string;
    statusIcon: string;
  }
}

declare const MovieStatusCellCssModule: MovieStatusCellCssNamespace.IMovieStatusCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieStatusCellCssNamespace.IMovieStatusCellCss;
};

export = MovieStatusCellCssModule;
