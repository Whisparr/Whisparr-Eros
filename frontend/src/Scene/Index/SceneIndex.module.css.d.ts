declare namespace SceneIndexModuleCssNamespace {
  export interface ISceneIndexModuleCss {
    contentBody: string;
    contentBodyContainer: string;
    errorMessage: string;
    pageContentBodyWrapper: string;
    postersInnerContentBody: string;
    tableInnerContentBody: string;
  }
}

declare const SceneIndexModuleCssModule: SceneIndexModuleCssNamespace.ISceneIndexModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexModuleCssNamespace.ISceneIndexModuleCss;
};

export = SceneIndexModuleCssModule;
