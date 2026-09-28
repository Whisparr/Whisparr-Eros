declare namespace AddNewMovieSearchResultModuleCssNamespace {
  export interface IAddNewMovieSearchResultModuleCss {
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

declare const AddNewMovieSearchResultModuleCssModule: AddNewMovieSearchResultModuleCssNamespace.IAddNewMovieSearchResultModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewMovieSearchResultModuleCssNamespace.IAddNewMovieSearchResultModuleCss;
};

export = AddNewMovieSearchResultModuleCssModule;
