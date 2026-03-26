declare namespace ImportMovieTableCssNamespace {
  export interface IImportMovieTableCss {
    row: string;
    tableBody: string;
  }
}

declare const ImportMovieTableCssModule: ImportMovieTableCssNamespace.IImportMovieTableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieTableCssNamespace.IImportMovieTableCss;
};

export = ImportMovieTableCssModule;
