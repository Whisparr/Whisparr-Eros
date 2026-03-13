declare namespace MovieStatusLabelCssNamespace {
  export interface IMovieStatusLabelCss {
    availNotMonitored: string;
    continuing: string;
    delete: string;
    ended: string;
    missingMonitored: string;
    missingUnmonitored: string;
    queue: string;
  }
}

declare const MovieStatusLabelCssModule: MovieStatusLabelCssNamespace.IMovieStatusLabelCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieStatusLabelCssNamespace.IMovieStatusLabelCss;
};

export = MovieStatusLabelCssModule;
