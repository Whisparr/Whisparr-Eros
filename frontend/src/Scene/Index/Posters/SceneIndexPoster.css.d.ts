declare namespace SceneIndexPosterCssNamespace {
  export interface ISceneIndexPosterCss {
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

declare const SceneIndexPosterCssModule: SceneIndexPosterCssNamespace.ISceneIndexPosterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexPosterCssNamespace.ISceneIndexPosterCss;
};

export = SceneIndexPosterCssModule;
