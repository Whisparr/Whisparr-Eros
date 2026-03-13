declare namespace SceneIndexOverviewInfoRowCssNamespace {
  export interface ISceneIndexOverviewInfoRowCss {
    icon: string;
    infoRow: string;
  }
}

declare const SceneIndexOverviewInfoRowCssModule: SceneIndexOverviewInfoRowCssNamespace.ISceneIndexOverviewInfoRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexOverviewInfoRowCssNamespace.ISceneIndexOverviewInfoRowCss;
};

export = SceneIndexOverviewInfoRowCssModule;
