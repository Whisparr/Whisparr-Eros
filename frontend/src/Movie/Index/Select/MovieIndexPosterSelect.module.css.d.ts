declare namespace MovieIndexPosterSelectModuleCssNamespace {
  export interface IMovieIndexPosterSelectModuleCss {
    checkButton: string;
    checkContainer: string;
    selected: string;
    unselected: string;
  }
}

declare const MovieIndexPosterSelectModuleCssModule: MovieIndexPosterSelectModuleCssNamespace.IMovieIndexPosterSelectModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexPosterSelectModuleCssNamespace.IMovieIndexPosterSelectModuleCss;
};

export = MovieIndexPosterSelectModuleCssModule;
