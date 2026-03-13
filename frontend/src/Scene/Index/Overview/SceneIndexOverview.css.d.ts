declare namespace SceneIndexOverviewCssNamespace {
  export interface ISceneIndexOverviewCss {
    actions: string;
    content: string;
    controls: string;
    details: string;
    editorSelect: string;
    ended: string;
    externalLinks: string;
    info: string;
    link: string;
    overview: string;
    poster: string;
    posterContainer: string;
    queue: string;
    title: string;
    titleRow: string;
  }
}

declare const SceneIndexOverviewCssModule: SceneIndexOverviewCssNamespace.ISceneIndexOverviewCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexOverviewCssNamespace.ISceneIndexOverviewCss;
};

export = SceneIndexOverviewCssModule;
