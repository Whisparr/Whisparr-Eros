declare namespace ImportMovieRootFolderRowModuleCssNamespace {
  export interface IImportMovieRootFolderRowModuleCss {
    actions: string;
    freeSpace: string;
    importFiles: string;
    importFormat: string;
    link: string;
    pathCell: string;
  }
}

declare const ImportMovieRootFolderRowModuleCssModule: ImportMovieRootFolderRowModuleCssNamespace.IImportMovieRootFolderRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieRootFolderRowModuleCssNamespace.IImportMovieRootFolderRowModuleCss;
};

export = ImportMovieRootFolderRowModuleCssModule;
