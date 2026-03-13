declare namespace ImportMovieRootFolderRowCssNamespace {
  export interface IImportMovieRootFolderRowCss {
    actions: string;
    freeSpace: string;
    importFiles: string;
    importFormat: string;
    link: string;
    pathCell: string;
  }
}

declare const ImportMovieRootFolderRowCssModule: ImportMovieRootFolderRowCssNamespace.IImportMovieRootFolderRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportMovieRootFolderRowCssNamespace.IImportMovieRootFolderRowCss;
};

export = ImportMovieRootFolderRowCssModule;
