declare namespace SceneIndexOverviewModuleCssNamespace {
  export interface ISceneIndexOverviewModuleCss {
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

declare const SceneIndexOverviewModuleCssModule: SceneIndexOverviewModuleCssNamespace.ISceneIndexOverviewModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexOverviewModuleCssNamespace.ISceneIndexOverviewModuleCss;
};

export = SceneIndexOverviewModuleCssModule;
