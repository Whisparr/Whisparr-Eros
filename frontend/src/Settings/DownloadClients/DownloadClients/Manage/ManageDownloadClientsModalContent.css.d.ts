declare namespace ManageDownloadClientsModalContentCssNamespace {
  export interface IManageDownloadClientsModalContentCss {
    deleteButton: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const ManageDownloadClientsModalContentCssModule: ManageDownloadClientsModalContentCssNamespace.IManageDownloadClientsModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageDownloadClientsModalContentCssNamespace.IManageDownloadClientsModalContentCss;
};

export = ManageDownloadClientsModalContentCssModule;
