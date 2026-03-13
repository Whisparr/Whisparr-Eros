declare namespace SceneIndexSelectFooterCssNamespace {
  export interface ISceneIndexSelectFooterCss {
    actionButtons: string;
    buttons: string;
    footer: string;
    selected: string;
  }
}

declare const SceneIndexSelectFooterCssModule: SceneIndexSelectFooterCssNamespace.ISceneIndexSelectFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexSelectFooterCssNamespace.ISceneIndexSelectFooterCss;
};

export = SceneIndexSelectFooterCssModule;
