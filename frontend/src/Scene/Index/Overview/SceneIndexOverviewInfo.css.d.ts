declare namespace SceneIndexOverviewInfoCssNamespace {
  export interface ISceneIndexOverviewInfoCss {
    infos: string;
  }
}

declare const SceneIndexOverviewInfoCssModule: SceneIndexOverviewInfoCssNamespace.ISceneIndexOverviewInfoCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexOverviewInfoCssNamespace.ISceneIndexOverviewInfoCss;
};

export = SceneIndexOverviewInfoCssModule;
