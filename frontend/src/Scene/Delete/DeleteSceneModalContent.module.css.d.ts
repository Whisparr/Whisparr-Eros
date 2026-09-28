declare namespace DeleteSceneModalContentModuleCssNamespace {
  export interface IDeleteSceneModalContentModuleCss {
    deleteCount: string;
    deleteFilesMessage: string;
    folderPath: string;
    pathContainer: string;
    pathIcon: string;
  }
}

declare const DeleteSceneModalContentModuleCssModule: DeleteSceneModalContentModuleCssNamespace.IDeleteSceneModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteSceneModalContentModuleCssNamespace.IDeleteSceneModalContentModuleCss;
};

export = DeleteSceneModalContentModuleCssModule;
