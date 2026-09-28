declare namespace DeleteMovieModalModuleCssNamespace {
  export interface IDeleteMovieModalModuleCss {
    warningText: string;
  }
}

declare const DeleteMovieModalModuleCssModule: DeleteMovieModalModuleCssNamespace.IDeleteMovieModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteMovieModalModuleCssNamespace.IDeleteMovieModalModuleCss;
};

export = DeleteMovieModalModuleCssModule;
