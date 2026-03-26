declare namespace AddNewMovieCssNamespace {
  export interface IAddNewMovieCss {
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

declare const AddNewMovieCssModule: AddNewMovieCssNamespace.IAddNewMovieCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewMovieCssNamespace.IAddNewMovieCss;
};

export = AddNewMovieCssModule;
