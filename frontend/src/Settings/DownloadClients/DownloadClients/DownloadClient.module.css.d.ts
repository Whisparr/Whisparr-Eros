declare namespace DownloadClientModuleCssNamespace {
  export interface IDownloadClientModuleCss {
    downloadClient: string;
    enabled: string;
    name: string;
  }
}

declare const DownloadClientModuleCssModule: DownloadClientModuleCssNamespace.IDownloadClientModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DownloadClientModuleCssNamespace.IDownloadClientModuleCss;
};

export = DownloadClientModuleCssModule;
