declare namespace ImportMovieSearchResultModuleCssNamespace {
  export interface IImportMovieSearchResultModuleCss {
    container: string;
    movie: string;
    stashdbLink: string;
    stashdbLinkIcon: string;
    tmdbLink: string;
    tmdbLinkIcon: string;
    tpdbLink: string;
    tpdbLinkIcon: string;
  }
}

declare const ImportMovieSearchResultModuleCssModule: ImportMovieSearchResultModuleCssNamespace.IImportMovieSearchResultModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieSearchResultModuleCssNamespace.IImportMovieSearchResultModuleCss;
};

export = ImportMovieSearchResultModuleCssModule;
