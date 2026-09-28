declare namespace ManageImportListsModalContentModuleCssNamespace {
  export interface IManageImportListsModalContentModuleCss {
    deleteButton: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const ManageImportListsModalContentModuleCssModule: ManageImportListsModalContentModuleCssNamespace.IManageImportListsModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageImportListsModalContentModuleCssNamespace.IManageImportListsModalContentModuleCss;
};

export = ManageImportListsModalContentModuleCssModule;
