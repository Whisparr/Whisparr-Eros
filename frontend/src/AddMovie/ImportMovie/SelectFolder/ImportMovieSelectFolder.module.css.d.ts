declare namespace ImportMovieSelectFolderModuleCssNamespace {
  export interface IImportMovieSelectFolderModuleCss {
    addErrorAlert: string;
    code: string;
    header: string;
    importButtonIcon: string;
    recentFolders: string;
    startImport: string;
    tip: string;
    tips: string;
  }
}

declare const ImportMovieSelectFolderModuleCssModule: ImportMovieSelectFolderModuleCssNamespace.IImportMovieSelectFolderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieSelectFolderModuleCssNamespace.IImportMovieSelectFolderModuleCss;
};

export = ImportMovieSelectFolderModuleCssModule;
