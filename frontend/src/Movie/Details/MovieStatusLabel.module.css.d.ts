declare namespace MovieStatusLabelModuleCssNamespace {
  export interface IMovieStatusLabelModuleCss {
    availNotMonitored: string;
    continuing: string;
    delete: string;
    ended: string;
    missingMonitored: string;
    missingUnmonitored: string;
    queue: string;
  }
}

declare const MovieStatusLabelModuleCssModule: MovieStatusLabelModuleCssNamespace.IMovieStatusLabelModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieStatusLabelModuleCssNamespace.IMovieStatusLabelModuleCss;
};

export = MovieStatusLabelModuleCssModule;
