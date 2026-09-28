declare namespace MovieStatusModuleCssNamespace {
  export interface IMovieStatusModuleCss {
    center: string;
  }
}

declare const MovieStatusModuleCssModule: MovieStatusModuleCssNamespace.IMovieStatusModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieStatusModuleCssNamespace.IMovieStatusModuleCss;
};

export = MovieStatusModuleCssModule;
