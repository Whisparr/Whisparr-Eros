declare namespace DeleteSceneModalContentCssNamespace {
  export interface IDeleteSceneModalContentCss {
    deleteFilesMessage: string;
    pathContainer: string;
    pathIcon: string;
  }
}

declare const DeleteSceneModalContentCssModule: DeleteSceneModalContentCssNamespace.IDeleteSceneModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteSceneModalContentCssNamespace.IDeleteSceneModalContentCss;
};

export = DeleteSceneModalContentCssModule;
