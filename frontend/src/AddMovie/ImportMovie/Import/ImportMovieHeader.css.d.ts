declare namespace ImportMovieHeaderCssNamespace {
  export interface IImportMovieHeaderCss {
    detailsIcon: string;
    folder: string;
    monitor: string;
    movie: string;
    qualityProfile: string;
  }
}

declare const ImportMovieHeaderCssModule: ImportMovieHeaderCssNamespace.IImportMovieHeaderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieHeaderCssNamespace.IImportMovieHeaderCss;
};

export = ImportMovieHeaderCssModule;
