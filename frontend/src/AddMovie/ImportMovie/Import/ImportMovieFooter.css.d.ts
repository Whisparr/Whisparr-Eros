declare namespace ImportMovieFooterCssNamespace {
  export interface IImportMovieFooterCss {
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

declare const ImportMovieFooterCssModule: ImportMovieFooterCssNamespace.IImportMovieFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieFooterCssNamespace.IImportMovieFooterCss;
};

export = ImportMovieFooterCssModule;
