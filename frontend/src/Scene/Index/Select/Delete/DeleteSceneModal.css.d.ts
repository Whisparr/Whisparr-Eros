declare namespace DeleteSceneModalCssNamespace {
  export interface IDeleteSceneModalCss {
    warningText: string;
  }
}

declare const DeleteSceneModalCssModule: DeleteSceneModalCssNamespace.IDeleteSceneModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteSceneModalCssNamespace.IDeleteSceneModalCss;
};

export = DeleteSceneModalCssModule;
