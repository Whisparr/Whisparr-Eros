declare namespace UnmappedFilesTableCssNamespace {
  export interface IUnmappedFilesTableCss {
    folderStructure: string;
    folderStructureHeading: string;
    row: string;
    sceneImportHaveMore: string;
    sceneImportNote: string;
    sceneImportStep: string;
  }
}

declare const UnmappedFilesTableCssModule: UnmappedFilesTableCssNamespace.IUnmappedFilesTableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UnmappedFilesTableCssNamespace.IUnmappedFilesTableCss;
};

export = UnmappedFilesTableCssModule;
