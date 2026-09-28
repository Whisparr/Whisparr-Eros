declare namespace MovieIndexTableModuleCssNamespace {
  export interface IMovieIndexTableModuleCss {
    row: string;
    tableScroller: string;
  }
}

declare const MovieIndexTableModuleCssModule: MovieIndexTableModuleCssNamespace.IMovieIndexTableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexTableModuleCssNamespace.IMovieIndexTableModuleCss;
};

export = MovieIndexTableModuleCssModule;
