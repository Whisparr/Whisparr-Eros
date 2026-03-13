declare namespace ManageDownloadClientsModalRowCssNamespace {
  export interface IManageDownloadClientsModalRowCss {
    enable: string;
    implementation: string;
    name: string;
    priority: string;
    removeCompletedDownloads: string;
    removeFailedDownloads: string;
    tags: string;
  }
}

declare const ManageDownloadClientsModalRowCssModule: ManageDownloadClientsModalRowCssNamespace.IManageDownloadClientsModalRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageDownloadClientsModalRowCssNamespace.IManageDownloadClientsModalRowCss;
};

export = ManageDownloadClientsModalRowCssModule;
