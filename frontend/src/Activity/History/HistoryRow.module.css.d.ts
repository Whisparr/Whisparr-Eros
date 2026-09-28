declare namespace HistoryRowModuleCssNamespace {
  export interface IHistoryRowModuleCss {
    customFormatScore: string;
    details: string;
    downloadClient: string;
    indexer: string;
    releaseGroup: string;
  }
}

declare const HistoryRowModuleCssModule: HistoryRowModuleCssNamespace.IHistoryRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HistoryRowModuleCssNamespace.IHistoryRowModuleCss;
};

export = HistoryRowModuleCssModule;
