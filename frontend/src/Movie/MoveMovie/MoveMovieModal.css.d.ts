declare namespace MoveMovieModalCssNamespace {
  export interface IMoveMovieModalCss {
    doNotMoveButton: string;
    folderRenameMessage: string;
  }
}

declare const MoveMovieModalCssModule: MoveMovieModalCssNamespace.IMoveMovieModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MoveMovieModalCssNamespace.IMoveMovieModalCss;
};

export = MoveMovieModalCssModule;
