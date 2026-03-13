declare namespace ManageImportListsEditModalContentCssNamespace {
  export interface IManageImportListsEditModalContentCss {
    modalFooter: string;
    selected: string;
  }
}

declare const ManageImportListsEditModalContentCssModule: ManageImportListsEditModalContentCssNamespace.IManageImportListsEditModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageImportListsEditModalContentCssNamespace.IManageImportListsEditModalContentCss;
};

export = ManageImportListsEditModalContentCssModule;
