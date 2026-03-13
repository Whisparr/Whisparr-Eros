declare namespace DownloadClientCssNamespace {
  export interface IDownloadClientCss {
    downloadClient: string;
    enabled: string;
    name: string;
  }
}

declare const DownloadClientCssModule: DownloadClientCssNamespace.IDownloadClientCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DownloadClientCssNamespace.IDownloadClientCss;
};

export = DownloadClientCssModule;
