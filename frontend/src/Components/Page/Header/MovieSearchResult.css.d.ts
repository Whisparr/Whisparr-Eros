declare namespace MovieSearchResultCssNamespace {
  export interface IMovieSearchResultCss {
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

declare const MovieSearchResultCssModule: MovieSearchResultCssNamespace.IMovieSearchResultCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieSearchResultCssNamespace.IMovieSearchResultCss;
};

export = MovieSearchResultCssModule;
