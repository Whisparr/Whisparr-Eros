declare namespace SceneIndexProgressBarCssNamespace {
  export interface ISceneIndexProgressBarCss {
    progress: string;
    progressBar: string;
    progressRadius: string;
  }
}

declare const SceneIndexProgressBarCssModule: SceneIndexProgressBarCssNamespace.ISceneIndexProgressBarCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexProgressBarCssNamespace.ISceneIndexProgressBarCss;
};

export = SceneIndexProgressBarCssModule;
