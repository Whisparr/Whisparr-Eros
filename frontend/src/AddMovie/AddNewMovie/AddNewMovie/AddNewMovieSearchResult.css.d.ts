declare namespace AddNewMovieSearchResultCssNamespace {
  export interface IAddNewMovieSearchResultCss {
    alreadyExistsIcon: string;
    certification: string;
    content: string;
    credits: string;
    exclusionIcon: string;
    genres: string;
    icons: string;
    links: string;
    originalLanguage: string;
    overlay: string;
    overview: string;
    poster: string;
    posterContainer: string;
    runtime: string;
    scene: string;
    searchResult: string;
    statusContainer: string;
    studio: string;
    title: string;
    titleContainer: string;
    titleRow: string;
    underlay: string;
    year: string;
  }
}

declare const AddNewMovieSearchResultCssModule: AddNewMovieSearchResultCssNamespace.IAddNewMovieSearchResultCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewMovieSearchResultCssNamespace.IAddNewMovieSearchResultCss;
};

export = AddNewMovieSearchResultCssModule;
