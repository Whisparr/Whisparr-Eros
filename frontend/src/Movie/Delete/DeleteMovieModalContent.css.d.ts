declare namespace DeleteMovieModalContentCssNamespace {
  export interface IDeleteMovieModalContentCss {
    deleteCount: string;
    deleteFilesMessage: string;
    folderPath: string;
    pathContainer: string;
    pathIcon: string;
  }
}

declare const DeleteMovieModalContentCssModule: DeleteMovieModalContentCssNamespace.IDeleteMovieModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteMovieModalContentCssNamespace.IDeleteMovieModalContentCss;
};

export = DeleteMovieModalContentCssModule;
