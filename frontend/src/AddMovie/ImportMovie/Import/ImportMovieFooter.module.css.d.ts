declare namespace ImportMovieFooterModuleCssNamespace {
  export interface IImportMovieFooterModuleCss {
    importButton: string;
    importButtonContainer: string;
    importError: string;
    inputContainer: string;
    label: string;
    loading: string;
    loadingButton: string;
    refreshButton: string;
  }
}

declare const ImportMovieFooterModuleCssModule: ImportMovieFooterModuleCssNamespace.IImportMovieFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieFooterModuleCssNamespace.IImportMovieFooterModuleCss;
};

export = ImportMovieFooterModuleCssModule;
