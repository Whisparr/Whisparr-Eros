declare namespace ImportMovieSelectFolderCssNamespace {
  export interface IImportMovieSelectFolderCss {
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

declare const ImportMovieSelectFolderCssModule: ImportMovieSelectFolderCssNamespace.IImportMovieSelectFolderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieSelectFolderCssNamespace.IImportMovieSelectFolderCss;
};

export = ImportMovieSelectFolderCssModule;
