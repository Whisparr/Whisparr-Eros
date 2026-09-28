declare namespace ImportListModuleCssNamespace {
  export interface IImportListModuleCss {
    cloneButton: string;
    enabled: string;
    list: string;
    name: string;
    nameContainer: string;
  }
}

declare const ImportListModuleCssModule: ImportListModuleCssNamespace.IImportListModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportListModuleCssNamespace.IImportListModuleCss;
};

export = ImportListModuleCssModule;
