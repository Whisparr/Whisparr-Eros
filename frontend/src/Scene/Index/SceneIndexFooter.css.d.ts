declare namespace SceneIndexFooterCssNamespace {
  export interface ISceneIndexFooterCss {
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

declare const SceneIndexFooterCssModule: SceneIndexFooterCssNamespace.ISceneIndexFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexFooterCssNamespace.ISceneIndexFooterCss;
};

export = SceneIndexFooterCssModule;
