declare namespace SceneIndexPosterInfoModuleCssNamespace {
  export interface ISceneIndexPosterInfoModuleCss {
    info: string;
    title: string;
  }
}

declare const SceneIndexPosterInfoModuleCssModule: SceneIndexPosterInfoModuleCssNamespace.ISceneIndexPosterInfoModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexPosterInfoModuleCssNamespace.ISceneIndexPosterInfoModuleCss;
};

export = SceneIndexPosterInfoModuleCssModule;
