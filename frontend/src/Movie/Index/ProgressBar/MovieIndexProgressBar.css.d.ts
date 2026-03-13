declare namespace MovieIndexProgressBarCssNamespace {
  export interface IMovieIndexProgressBarCss {
    progress: string;
    progressBar: string;
    progressRadius: string;
  }
}

declare const MovieIndexProgressBarCssModule: MovieIndexProgressBarCssNamespace.IMovieIndexProgressBarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexProgressBarCssNamespace.IMovieIndexProgressBarCss;
};

export = MovieIndexProgressBarCssModule;
