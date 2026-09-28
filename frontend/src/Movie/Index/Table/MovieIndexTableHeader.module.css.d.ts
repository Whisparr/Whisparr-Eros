declare namespace MovieIndexTableHeaderModuleCssNamespace {
  export interface IMovieIndexTableHeaderModuleCss {
    actions: string;
    added: string;
    genres: string;
    movieStatus: string;
    originalLanguage: string;
    path: string;
    qualityProfileId: string;
    releaseDate: string;
    releaseGroups: string;
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

declare const MovieIndexTableHeaderModuleCssModule: MovieIndexTableHeaderModuleCssNamespace.IMovieIndexTableHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexTableHeaderModuleCssNamespace.IMovieIndexTableHeaderModuleCss;
};

export = MovieIndexTableHeaderModuleCssModule;
