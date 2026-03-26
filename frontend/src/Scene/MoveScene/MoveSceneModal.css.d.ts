declare namespace MoveSceneModalCssNamespace {
  export interface IMoveSceneModalCss {
    doNotMoveButton: string;
  }
}

declare const MoveSceneModalCssModule: MoveSceneModalCssNamespace.IMoveSceneModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MoveSceneModalCssNamespace.IMoveSceneModalCss;
};

export = MoveSceneModalCssModule;
