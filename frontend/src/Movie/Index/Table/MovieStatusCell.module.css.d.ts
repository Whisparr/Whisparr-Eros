declare namespace MovieStatusCellModuleCssNamespace {
  export interface IMovieStatusCellModuleCss {
    status: string;
    statusIcon: string;
  }
}

declare const MovieStatusCellModuleCssModule: MovieStatusCellModuleCssNamespace.IMovieStatusCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieStatusCellModuleCssNamespace.IMovieStatusCellModuleCss;
};

export = MovieStatusCellModuleCssModule;
