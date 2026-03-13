declare namespace DeleteMovieModalCssNamespace {
  export interface IDeleteMovieModalCss {
    warningText: string;
  }
}

declare const DeleteMovieModalCssModule: DeleteMovieModalCssNamespace.IDeleteMovieModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteMovieModalCssNamespace.IDeleteMovieModalCss;
};

export = DeleteMovieModalCssModule;
