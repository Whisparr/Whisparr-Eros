declare namespace SceneIndexTableModuleCssNamespace {
  export interface ISceneIndexTableModuleCss {
    row: string;
    tableScroller: string;
  }
}

declare const SceneIndexTableModuleCssModule: SceneIndexTableModuleCssNamespace.ISceneIndexTableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexTableModuleCssNamespace.ISceneIndexTableModuleCss;
};

export = SceneIndexTableModuleCssModule;
