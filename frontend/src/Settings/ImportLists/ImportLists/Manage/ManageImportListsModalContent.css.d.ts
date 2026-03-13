declare namespace ManageImportListsModalContentCssNamespace {
  export interface IManageImportListsModalContentCss {
    deleteButton: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const ManageImportListsModalContentCssModule: ManageImportListsModalContentCssNamespace.IManageImportListsModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageImportListsModalContentCssNamespace.IManageImportListsModalContentCss;
};

export = ManageImportListsModalContentCssModule;
