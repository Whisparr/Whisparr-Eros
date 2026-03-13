declare namespace MovieIndexPosterSelectCssNamespace {
  export interface IMovieIndexPosterSelectCss {
    checkButton: string;
    checkContainer: string;
    selected: string;
    unselected: string;
  }
}

declare const MovieIndexPosterSelectCssModule: MovieIndexPosterSelectCssNamespace.IMovieIndexPosterSelectCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexPosterSelectCssNamespace.IMovieIndexPosterSelectCss;
};

export = MovieIndexPosterSelectCssModule;
