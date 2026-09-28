declare namespace ImportListsModuleCssNamespace {
  export interface IImportListsModuleCss {
    addList: string;
    center: string;
    lists: string;
  }
}

declare const ImportListsModuleCssModule: ImportListsModuleCssNamespace.IImportListsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportListsModuleCssNamespace.IImportListsModuleCss;
};

export = ImportListsModuleCssModule;
