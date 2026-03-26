declare namespace MovieIndexTableHeaderCssNamespace {
  export interface IMovieIndexTableHeaderCss {
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

declare const MovieIndexTableHeaderCssModule: MovieIndexTableHeaderCssNamespace.IMovieIndexTableHeaderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexTableHeaderCssNamespace.IMovieIndexTableHeaderCss;
};

export = MovieIndexTableHeaderCssModule;
