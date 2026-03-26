declare namespace UnmappedFilesTableRowCssNamespace {
  export interface IUnmappedFilesTableRowCss {
    actions: string;
    checkInput: string;
    dateAdded: string;
    path: string;
    quality: string;
    size: string;
  }
}

declare const UnmappedFilesTableRowCssModule: UnmappedFilesTableRowCssNamespace.IUnmappedFilesTableRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UnmappedFilesTableRowCssNamespace.IUnmappedFilesTableRowCss;
};

export = UnmappedFilesTableRowCssModule;
