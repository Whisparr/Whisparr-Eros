declare namespace DownloadClientsCssNamespace {
  export interface IDownloadClientsCss {
    addDownloadClient: string;
    center: string;
    downloadClients: string;
  }
}

declare const DownloadClientsCssModule: DownloadClientsCssNamespace.IDownloadClientsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DownloadClientsCssNamespace.IDownloadClientsCss;
};

export = DownloadClientsCssModule;
