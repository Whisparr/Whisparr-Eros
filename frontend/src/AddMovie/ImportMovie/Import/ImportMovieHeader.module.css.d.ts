declare namespace ImportMovieHeaderModuleCssNamespace {
  export interface IImportMovieHeaderModuleCss {
    detailsIcon: string;
    folder: string;
    monitor: string;
    movie: string;
    qualityProfile: string;
  }
}

declare const ImportMovieHeaderModuleCssModule: ImportMovieHeaderModuleCssNamespace.IImportMovieHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieHeaderModuleCssNamespace.IImportMovieHeaderModuleCss;
};

export = ImportMovieHeaderModuleCssModule;
