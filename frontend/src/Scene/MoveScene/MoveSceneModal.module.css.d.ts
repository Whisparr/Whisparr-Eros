declare namespace MoveSceneModalModuleCssNamespace {
  export interface IMoveSceneModalModuleCss {
    doNotMoveButton: string;
  }
}

declare const MoveSceneModalModuleCssModule: MoveSceneModalModuleCssNamespace.IMoveSceneModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MoveSceneModalModuleCssNamespace.IMoveSceneModalModuleCss;
};

export = MoveSceneModalModuleCssModule;
