declare namespace ImportListCssNamespace {
  export interface IImportListCss {
    cloneButton: string;
    enabled: string;
    list: string;
    name: string;
    nameContainer: string;
  }
}

declare const ImportListCssModule: ImportListCssNamespace.IImportListCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportListCssNamespace.IImportListCss;
};

export = ImportListCssModule;
