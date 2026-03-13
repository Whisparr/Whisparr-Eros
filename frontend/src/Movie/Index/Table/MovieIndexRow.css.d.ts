declare namespace MovieIndexRowCssNamespace {
  export interface IMovieIndexRowCss {
    actions: string;
    added: string;
    cell: string;
    checkInput: string;
    collection: string;
    externalLinks: string;
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

declare const MovieIndexRowCssModule: MovieIndexRowCssNamespace.IMovieIndexRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexRowCssNamespace.IMovieIndexRowCss;
};

export = MovieIndexRowCssModule;
