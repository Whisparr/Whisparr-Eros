declare namespace AddNewMovieModuleCssNamespace {
  export interface IAddNewMovieModuleCss {
    clearLookupButton: string;
    helpText: string;
    message: string;
    noMoviesText: string;
    noResults: string;
    searchContainer: string;
    searchIconContainer: string;
    searchInput: string;
    searchResults: string;
  }
}

declare const AddNewMovieModuleCssModule: AddNewMovieModuleCssNamespace.IAddNewMovieModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewMovieModuleCssNamespace.IAddNewMovieModuleCss;
};

export = AddNewMovieModuleCssModule;
