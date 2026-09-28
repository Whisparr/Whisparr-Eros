declare namespace SceneIndexPosterModuleCssNamespace {
  export interface ISceneIndexPosterModuleCss {
    action: string;
    blur: string;
    container: string;
    content: string;
    controls: string;
    editorSelect: string;
    ended: string;
    externalLinks: string;
    link: string;
    nextAiring: string;
    overlayTitle: string;
    poster: string;
    posterContainer: string;
    title: string;
  }
}

declare const SceneIndexPosterModuleCssModule: SceneIndexPosterModuleCssNamespace.ISceneIndexPosterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexPosterModuleCssNamespace.ISceneIndexPosterModuleCss;
};

export = SceneIndexPosterModuleCssModule;
