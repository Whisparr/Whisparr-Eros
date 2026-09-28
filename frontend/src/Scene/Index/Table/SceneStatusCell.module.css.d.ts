declare namespace SceneStatusCellModuleCssNamespace {
  export interface ISceneStatusCellModuleCss {
    status: string;
    statusIcon: string;
  }
}

declare const SceneStatusCellModuleCssModule: SceneStatusCellModuleCssNamespace.ISceneStatusCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneStatusCellModuleCssNamespace.ISceneStatusCellModuleCss;
};

export = SceneStatusCellModuleCssModule;
