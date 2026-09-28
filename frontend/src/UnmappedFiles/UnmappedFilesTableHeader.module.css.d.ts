declare namespace UnmappedFilesTableHeaderModuleCssNamespace {
  export interface IUnmappedFilesTableHeaderModuleCss {
    actions: string;
    dateAdded: string;
    path: string;
    quality: string;
    size: string;
  }
}

declare const UnmappedFilesTableHeaderModuleCssModule: UnmappedFilesTableHeaderModuleCssNamespace.IUnmappedFilesTableHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UnmappedFilesTableHeaderModuleCssNamespace.IUnmappedFilesTableHeaderModuleCss;
};

export = UnmappedFilesTableHeaderModuleCssModule;
