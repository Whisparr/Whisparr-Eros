declare namespace MovieSearchResultModuleCssNamespace {
  export interface IMovieSearchResultModuleCss {
    alternateTitle: string;
    itemType: string;
    itemTypeContainer: string;
    metaRow: string;
    poster: string;
    posterContainer: string;
    releaseDate: string;
    result: string;
    runtime: string;
    scene: string;
    sceneContainer: string;
    screenshot: string;
    studioIcon: string;
    studioTitle: string;
    title: string;
    titleContainer: string;
    titles: string;
  }
}

declare const MovieSearchResultModuleCssModule: MovieSearchResultModuleCssNamespace.IMovieSearchResultModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieSearchResultModuleCssNamespace.IMovieSearchResultModuleCss;
};

export = MovieSearchResultModuleCssModule;
