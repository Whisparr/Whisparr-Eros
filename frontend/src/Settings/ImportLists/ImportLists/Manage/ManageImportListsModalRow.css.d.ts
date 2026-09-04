declare namespace ManageImportListsModalRowCssNamespace {
  export interface IManageImportListsModalRowCss {
    enableAuto: string;
    enabled: string;
    implementation: string;
    name: string;
    qualityProfileId: string;
    rootFolderPath: string;
    tagExisting: string;
    tags: string;
  }
}

declare const ManageImportListsModalRowCssModule: ManageImportListsModalRowCssNamespace.IManageImportListsModalRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageImportListsModalRowCssNamespace.IManageImportListsModalRowCss;
};

export = ManageImportListsModalRowCssModule;
