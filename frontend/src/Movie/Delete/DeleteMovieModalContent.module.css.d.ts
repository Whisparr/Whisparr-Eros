declare namespace DeleteMovieModalContentModuleCssNamespace {
  export interface IDeleteMovieModalContentModuleCss {
    deleteCount: string;
    deleteFilesMessage: string;
    folderPath: string;
    pathContainer: string;
    pathIcon: string;
  }
}

declare const DeleteMovieModalContentModuleCssModule: DeleteMovieModalContentModuleCssNamespace.IDeleteMovieModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteMovieModalContentModuleCssNamespace.IDeleteMovieModalContentModuleCss;
};

export = DeleteMovieModalContentModuleCssModule;
