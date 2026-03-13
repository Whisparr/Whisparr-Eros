declare namespace MovieStatusCssNamespace {
  export interface IMovieStatusCss {
    center: string;
  }
}

declare const MovieStatusCssModule: MovieStatusCssNamespace.IMovieStatusCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieStatusCssNamespace.IMovieStatusCss;
};

export = MovieStatusCssModule;
