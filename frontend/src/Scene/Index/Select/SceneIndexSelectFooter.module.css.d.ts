declare namespace SceneIndexSelectFooterModuleCssNamespace {
  export interface ISceneIndexSelectFooterModuleCss {
    actionButtons: string;
    buttons: string;
    footer: string;
    selected: string;
  }
}

declare const SceneIndexSelectFooterModuleCssModule: SceneIndexSelectFooterModuleCssNamespace.ISceneIndexSelectFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexSelectFooterModuleCssNamespace.ISceneIndexSelectFooterModuleCss;
};

export = SceneIndexSelectFooterModuleCssModule;
