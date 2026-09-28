declare namespace DeleteMovieFilesModalContentModuleCssNamespace {
  export interface IDeleteMovieFilesModalContentModuleCss {
    deleteFilesMessage: string;
    message: string;
    path: string;
    pathContainer: string;
    statistics: string;
  }
}

declare const DeleteMovieFilesModalContentModuleCssModule: DeleteMovieFilesModalContentModuleCssNamespace.IDeleteMovieFilesModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteMovieFilesModalContentModuleCssNamespace.IDeleteMovieFilesModalContentModuleCss;
};

export = DeleteMovieFilesModalContentModuleCssModule;
