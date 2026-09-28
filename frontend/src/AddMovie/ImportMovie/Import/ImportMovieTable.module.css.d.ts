declare namespace ImportMovieTableModuleCssNamespace {
  export interface IImportMovieTableModuleCss {
    row: string;
    tableBody: string;
  }
}

declare const ImportMovieTableModuleCssModule: ImportMovieTableModuleCssNamespace.IImportMovieTableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieTableModuleCssNamespace.IImportMovieTableModuleCss;
};

export = ImportMovieTableModuleCssModule;
