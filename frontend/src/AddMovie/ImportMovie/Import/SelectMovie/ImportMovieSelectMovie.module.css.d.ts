declare namespace ImportMovieSelectMovieModuleCssNamespace {
  export interface IImportMovieSelectMovieModuleCss {
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

declare const ImportMovieSelectMovieModuleCssModule: ImportMovieSelectMovieModuleCssNamespace.IImportMovieSelectMovieModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieSelectMovieModuleCssNamespace.IImportMovieSelectMovieModuleCss;
};

export = ImportMovieSelectMovieModuleCssModule;
