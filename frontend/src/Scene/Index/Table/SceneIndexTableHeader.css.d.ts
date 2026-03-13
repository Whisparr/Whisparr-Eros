declare namespace SceneIndexTableHeaderCssNamespace {
  export interface ISceneIndexTableHeaderCss {
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

declare const SceneIndexTableHeaderCssModule: SceneIndexTableHeaderCssNamespace.ISceneIndexTableHeaderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SceneIndexTableHeaderCssNamespace.ISceneIndexTableHeaderCss;
};

export = SceneIndexTableHeaderCssModule;
