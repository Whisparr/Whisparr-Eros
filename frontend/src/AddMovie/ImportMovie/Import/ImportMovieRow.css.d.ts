declare namespace ImportMovieRowCssNamespace {
  export interface IImportMovieRowCss {
    folder: string;
    monitor: string;
    movie: string;
    qualityProfile: string;
    selectCell: string;
    selectInput: string;
  }
}

declare const ImportMovieRowCssModule: ImportMovieRowCssNamespace.IImportMovieRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieRowCssNamespace.IImportMovieRowCss;
};

export = ImportMovieRowCssModule;
