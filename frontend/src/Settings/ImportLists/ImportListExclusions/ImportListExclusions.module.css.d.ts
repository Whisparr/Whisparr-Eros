declare namespace ImportListExclusionsModuleCssNamespace {
  export interface IImportListExclusionsModuleCss {
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

declare const ImportListExclusionsModuleCssModule: ImportListExclusionsModuleCssNamespace.IImportListExclusionsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportListExclusionsModuleCssNamespace.IImportListExclusionsModuleCss;
};

export = ImportListExclusionsModuleCssModule;
