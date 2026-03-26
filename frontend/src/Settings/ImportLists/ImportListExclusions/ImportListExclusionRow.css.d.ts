declare namespace ImportListExclusionRowCssNamespace {
  export interface IImportListExclusionRowCss {
    actions: string;
    foreignId: string;
  }
}

declare const ImportListExclusionRowCssModule: ImportListExclusionRowCssNamespace.IImportListExclusionRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportListExclusionRowCssNamespace.IImportListExclusionRowCss;
};

export = ImportListExclusionRowCssModule;
