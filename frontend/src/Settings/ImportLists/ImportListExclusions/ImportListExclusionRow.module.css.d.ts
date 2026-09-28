declare namespace ImportListExclusionRowModuleCssNamespace {
  export interface IImportListExclusionRowModuleCss {
    actions: string;
    foreignId: string;
  }
}

declare const ImportListExclusionRowModuleCssModule: ImportListExclusionRowModuleCssNamespace.IImportListExclusionRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportListExclusionRowModuleCssNamespace.IImportListExclusionRowModuleCss;
};

export = ImportListExclusionRowModuleCssModule;
