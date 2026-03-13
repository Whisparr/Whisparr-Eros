declare namespace ImportMovieSearchResultCssNamespace {
  export interface IImportMovieSearchResultCss {
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

declare const ImportMovieSearchResultCssModule: ImportMovieSearchResultCssNamespace.IImportMovieSearchResultCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieSearchResultCssNamespace.IImportMovieSearchResultCss;
};

export = ImportMovieSearchResultCssModule;
