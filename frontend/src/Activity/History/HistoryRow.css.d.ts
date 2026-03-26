declare namespace HistoryRowCssNamespace {
  export interface IHistoryRowCss {
    customFormatScore: string;
    details: string;
    downloadClient: string;
    indexer: string;
    releaseGroup: string;
  }
}

declare const HistoryRowCssModule: HistoryRowCssNamespace.IHistoryRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HistoryRowCssNamespace.IHistoryRowCss;
};

export = HistoryRowCssModule;
