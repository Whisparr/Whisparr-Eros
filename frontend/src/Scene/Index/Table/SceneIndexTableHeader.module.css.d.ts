declare namespace SceneIndexTableHeaderModuleCssNamespace {
  export interface ISceneIndexTableHeaderModuleCss {
    actions: string;
    added: string;
    genres: string;
    movieStatus: string;
    originalLanguage: string;
    path: string;
    qualityProfileId: string;
    releaseDate: string;
    runtime: string;
    sizeOnDisk: string;
    sortTitle: string;
    status: string;
    studioTitle: string;
    tags: string;
    tmdbRating: string;
    year: string;
  }
}

declare const SceneIndexTableHeaderModuleCssModule: SceneIndexTableHeaderModuleCssNamespace.ISceneIndexTableHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexTableHeaderModuleCssNamespace.ISceneIndexTableHeaderModuleCss;
};

export = SceneIndexTableHeaderModuleCssModule;
