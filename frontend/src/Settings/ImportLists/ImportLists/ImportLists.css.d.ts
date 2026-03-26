declare namespace ImportListsCssNamespace {
  export interface IImportListsCss {
    addList: string;
    center: string;
    lists: string;
  }
}

declare const ImportListsCssModule: ImportListsCssNamespace.IImportListsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportListsCssNamespace.IImportListsCss;
};

export = ImportListsCssModule;
