declare namespace ManageImportListsModalRowModuleCssNamespace {
  export interface IManageImportListsModalRowModuleCss {
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

declare const ManageImportListsModalRowModuleCssModule: ManageImportListsModalRowModuleCssNamespace.IManageImportListsModalRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageImportListsModalRowModuleCssNamespace.IManageImportListsModalRowModuleCss;
};

export = ManageImportListsModalRowModuleCssModule;
