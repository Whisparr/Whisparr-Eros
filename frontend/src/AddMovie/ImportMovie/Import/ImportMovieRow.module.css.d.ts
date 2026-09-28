declare namespace ImportMovieRowModuleCssNamespace {
  export interface IImportMovieRowModuleCss {
    folder: string;
    monitor: string;
    movie: string;
    qualityProfile: string;
    selectCell: string;
    selectInput: string;
  }
}

declare const ImportMovieRowModuleCssModule: ImportMovieRowModuleCssNamespace.IImportMovieRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieRowModuleCssNamespace.IImportMovieRowModuleCss;
};

export = ImportMovieRowModuleCssModule;
