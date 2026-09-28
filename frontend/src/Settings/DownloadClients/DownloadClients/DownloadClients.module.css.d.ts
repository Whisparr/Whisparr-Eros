declare namespace DownloadClientsModuleCssNamespace {
  export interface IDownloadClientsModuleCss {
    addDownloadClient: string;
    center: string;
    downloadClients: string;
  }
}

declare const DownloadClientsModuleCssModule: DownloadClientsModuleCssNamespace.IDownloadClientsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DownloadClientsModuleCssNamespace.IDownloadClientsModuleCss;
};

export = DownloadClientsModuleCssModule;
