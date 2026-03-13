declare namespace MovieIndexCssNamespace {
  export interface IMovieIndexCss {
    contentBody: string;
    contentBodyContainer: string;
    errorMessage: string;
    pageContentBodyWrapper: string;
    postersInnerContentBody: string;
    tableInnerContentBody: string;
  }
}

declare const MovieIndexCssModule: MovieIndexCssNamespace.IMovieIndexCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexCssNamespace.IMovieIndexCss;
};

export = MovieIndexCssModule;
