declare namespace SceneIndexFooterModuleCssNamespace {
  export interface ISceneIndexFooterModuleCss {
    availNotMonitored: string;
    continuing: string;
    ended: string;
    footer: string;
    legendItem: string;
    legendItemColor: string;
    missingMonitored: string;
    missingUnmonitored: string;
    queue: string;
    statistics: string;
  }
}

declare const SceneIndexFooterModuleCssModule: SceneIndexFooterModuleCssNamespace.ISceneIndexFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexFooterModuleCssNamespace.ISceneIndexFooterModuleCss;
};

export = SceneIndexFooterModuleCssModule;
