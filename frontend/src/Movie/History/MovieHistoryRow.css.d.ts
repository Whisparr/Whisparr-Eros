declare namespace MovieHistoryRowCssNamespace {
  export interface IMovieHistoryRowCss {
    actions: string;
    customFormatScore: string;
    sourceTitle: string;
  }
}

declare const MovieHistoryRowCssModule: MovieHistoryRowCssNamespace.IMovieHistoryRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieHistoryRowCssNamespace.IMovieHistoryRowCss;
};

export = MovieHistoryRowCssModule;
