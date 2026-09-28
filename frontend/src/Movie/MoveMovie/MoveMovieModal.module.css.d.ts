declare namespace MoveMovieModalModuleCssNamespace {
  export interface IMoveMovieModalModuleCss {
    doNotMoveButton: string;
    folderRenameMessage: string;
  }
}

declare const MoveMovieModalModuleCssModule: MoveMovieModalModuleCssNamespace.IMoveMovieModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MoveMovieModalModuleCssNamespace.IMoveMovieModalModuleCss;
};

export = MoveMovieModalModuleCssModule;
