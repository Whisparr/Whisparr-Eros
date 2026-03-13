declare namespace ImportListExclusionsCssNamespace {
  export interface IImportListExclusionsCss {
    actions: string;
    addButton: string;
    addImportListExclusion: string;
    checkboxContainer: string;
    foreignId: string;
    importExclusionDropdownContainer: string;
    importExclusionFilterForm: string;
    importListExclusionInfoContainer: string;
    importListExclusionRow: string;
    importListExclusionsHeader: string;
    title: string;
    type: string;
  }
}

declare const ImportListExclusionsCssModule: ImportListExclusionsCssNamespace.IImportListExclusionsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportListExclusionsCssNamespace.IImportListExclusionsCss;
};

export = ImportListExclusionsCssModule;
