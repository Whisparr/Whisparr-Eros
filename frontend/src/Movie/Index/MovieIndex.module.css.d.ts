declare namespace MovieIndexModuleCssNamespace {
  export interface IMovieIndexModuleCss {
    contentBody: string;
    contentBodyContainer: string;
    errorMessage: string;
    pageContentBodyWrapper: string;
    postersInnerContentBody: string;
    tableInnerContentBody: string;
  }
}

declare const MovieIndexModuleCssModule: MovieIndexModuleCssNamespace.IMovieIndexModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexModuleCssNamespace.IMovieIndexModuleCss;
};

export = MovieIndexModuleCssModule;
