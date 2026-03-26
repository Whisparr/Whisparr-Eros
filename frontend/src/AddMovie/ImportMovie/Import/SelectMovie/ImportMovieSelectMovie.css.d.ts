declare namespace ImportMovieSelectMovieCssNamespace {
  export interface IImportMovieSelectMovieCss {
    button: string;
    content: string;
    contentContainer: string;
    dropdownArrowContainer: string;
    existing: string;
    loading: string;
    noMatches: string;
    results: string;
    searchContainer: string;
    searchIconContainer: string;
    searchInput: string;
    warningIcon: string;
  }
}

declare const ImportMovieSelectMovieCssModule: ImportMovieSelectMovieCssNamespace.IImportMovieSelectMovieCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieSelectMovieCssNamespace.IImportMovieSelectMovieCss;
};

export = ImportMovieSelectMovieCssModule;
