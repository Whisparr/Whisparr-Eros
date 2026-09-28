declare namespace ManageDownloadClientsModalContentModuleCssNamespace {
  export interface IManageDownloadClientsModalContentModuleCss {
    deleteButton: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const ManageDownloadClientsModalContentModuleCssModule: ManageDownloadClientsModalContentModuleCssNamespace.IManageDownloadClientsModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageDownloadClientsModalContentModuleCssNamespace.IManageDownloadClientsModalContentModuleCss;
};

export = ManageDownloadClientsModalContentModuleCssModule;
