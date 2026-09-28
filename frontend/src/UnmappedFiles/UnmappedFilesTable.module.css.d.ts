declare namespace UnmappedFilesTableModuleCssNamespace {
  export interface IUnmappedFilesTableModuleCss {
    folderStructure: string;
    folderStructureHeading: string;
    row: string;
    sceneImportHaveMore: string;
    sceneImportNote: string;
    sceneImportStep: string;
  }
}

declare const UnmappedFilesTableModuleCssModule: UnmappedFilesTableModuleCssNamespace.IUnmappedFilesTableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UnmappedFilesTableModuleCssNamespace.IUnmappedFilesTableModuleCss;
};

export = UnmappedFilesTableModuleCssModule;
