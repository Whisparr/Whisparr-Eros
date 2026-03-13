declare namespace SceneIndexTableCssNamespace {
  export interface ISceneIndexTableCss {
    row: string;
    tableScroller: string;
  }
}

declare const SceneIndexTableCssModule: SceneIndexTableCssNamespace.ISceneIndexTableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexTableCssNamespace.ISceneIndexTableCss;
};

export = SceneIndexTableCssModule;
