declare namespace UnmappedFilesTableHeaderCssNamespace {
  export interface IUnmappedFilesTableHeaderCss {
    actions: string;
    dateAdded: string;
    path: string;
    quality: string;
    size: string;
  }
}

declare const UnmappedFilesTableHeaderCssModule: UnmappedFilesTableHeaderCssNamespace.IUnmappedFilesTableHeaderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: UnmappedFilesTableHeaderCssNamespace.IUnmappedFilesTableHeaderCss;
};

export = UnmappedFilesTableHeaderCssModule;
