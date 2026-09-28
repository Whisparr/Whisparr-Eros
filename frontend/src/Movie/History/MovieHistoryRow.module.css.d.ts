declare namespace MovieHistoryRowModuleCssNamespace {
  export interface IMovieHistoryRowModuleCss {
    actions: string;
    customFormatScore: string;
    sourceTitle: string;
  }
}

declare const MovieHistoryRowModuleCssModule: MovieHistoryRowModuleCssNamespace.IMovieHistoryRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieHistoryRowModuleCssNamespace.IMovieHistoryRowModuleCss;
};

export = MovieHistoryRowModuleCssModule;
