declare namespace ManageDownloadClientsModalRowModuleCssNamespace {
  export interface IManageDownloadClientsModalRowModuleCss {
    enable: string;
    implementation: string;
    name: string;
    priority: string;
    protocol: string;
    removeCompletedDownloads: string;
    removeFailedDownloads: string;
    tags: string;
  }
}

declare const ManageDownloadClientsModalRowModuleCssModule: ManageDownloadClientsModalRowModuleCssNamespace.IManageDownloadClientsModalRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageDownloadClientsModalRowModuleCssNamespace.IManageDownloadClientsModalRowModuleCss;
};

export = ManageDownloadClientsModalRowModuleCssModule;
