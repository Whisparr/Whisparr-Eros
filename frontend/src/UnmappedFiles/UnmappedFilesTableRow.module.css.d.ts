declare namespace UnmappedFilesTableRowModuleCssNamespace {
  export interface IUnmappedFilesTableRowModuleCss {
    actions: string;
    checkInput: string;
    dateAdded: string;
    path: string;
    quality: string;
    size: string;
  }
}

declare const UnmappedFilesTableRowModuleCssModule: UnmappedFilesTableRowModuleCssNamespace.IUnmappedFilesTableRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UnmappedFilesTableRowModuleCssNamespace.IUnmappedFilesTableRowModuleCss;
};

export = UnmappedFilesTableRowModuleCssModule;
