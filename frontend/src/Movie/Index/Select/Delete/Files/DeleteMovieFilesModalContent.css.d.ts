declare namespace DeleteMovieFilesModalContentCssNamespace {
  export interface IDeleteMovieFilesModalContentCss {
    deleteFilesMessage: string;
    message: string;
    path: string;
    pathContainer: string;
    statistics: string;
  }
}

declare const DeleteMovieFilesModalContentCssModule: DeleteMovieFilesModalContentCssNamespace.IDeleteMovieFilesModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteMovieFilesModalContentCssNamespace.IDeleteMovieFilesModalContentCss;
};

export = DeleteMovieFilesModalContentCssModule;
