declare namespace MovieIndexProgressBarModuleCssNamespace {
  export interface IMovieIndexProgressBarModuleCss {
    progress: string;
    progressBar: string;
    progressRadius: string;
  }
}

declare const MovieIndexProgressBarModuleCssModule: MovieIndexProgressBarModuleCssNamespace.IMovieIndexProgressBarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexProgressBarModuleCssNamespace.IMovieIndexProgressBarModuleCss;
};

export = MovieIndexProgressBarModuleCssModule;
