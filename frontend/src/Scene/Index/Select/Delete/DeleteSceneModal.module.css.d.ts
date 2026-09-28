declare namespace DeleteSceneModalModuleCssNamespace {
  export interface IDeleteSceneModalModuleCss {
    warningText: string;
  }
}

declare const DeleteSceneModalModuleCssModule: DeleteSceneModalModuleCssNamespace.IDeleteSceneModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteSceneModalModuleCssNamespace.IDeleteSceneModalModuleCss;
};

export = DeleteSceneModalModuleCssModule;
