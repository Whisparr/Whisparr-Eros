declare namespace SceneStatusCellCssNamespace {
  export interface ISceneStatusCellCss {
    status: string;
    statusIcon: string;
  }
}

declare const SceneStatusCellCssModule: SceneStatusCellCssNamespace.ISceneStatusCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneStatusCellCssNamespace.ISceneStatusCellCss;
};

export = SceneStatusCellCssModule;
