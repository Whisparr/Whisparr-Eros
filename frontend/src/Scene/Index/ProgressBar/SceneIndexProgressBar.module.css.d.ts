declare namespace SceneIndexProgressBarModuleCssNamespace {
  export interface ISceneIndexProgressBarModuleCss {
    progress: string;
    progressBar: string;
    progressRadius: string;
  }
}

declare const SceneIndexProgressBarModuleCssModule: SceneIndexProgressBarModuleCssNamespace.ISceneIndexProgressBarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexProgressBarModuleCssNamespace.ISceneIndexProgressBarModuleCss;
};

export = SceneIndexProgressBarModuleCssModule;
