declare namespace SceneIndexPosterInfoCssNamespace {
  export interface ISceneIndexPosterInfoCss {
    info: string;
    title: string;
  }
}

declare const SceneIndexPosterInfoCssModule: SceneIndexPosterInfoCssNamespace.ISceneIndexPosterInfoCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexPosterInfoCssNamespace.ISceneIndexPosterInfoCss;
};

export = SceneIndexPosterInfoCssModule;
