declare namespace SceneIndexCssNamespace {
  export interface ISceneIndexCss {
    contentBody: string;
    contentBodyContainer: string;
    errorMessage: string;
    pageContentBodyWrapper: string;
    postersInnerContentBody: string;
    tableInnerContentBody: string;
  }
}

declare const SceneIndexCssModule: SceneIndexCssNamespace.ISceneIndexCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexCssNamespace.ISceneIndexCss;
};

export = SceneIndexCssModule;
