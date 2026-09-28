declare namespace HistoryDetailsModalModuleCssNamespace {
  export interface IHistoryDetailsModalModuleCss {
    markAsFailedButton: string;
  }
}

declare const HistoryDetailsModalModuleCssModule: HistoryDetailsModalModuleCssNamespace.IHistoryDetailsModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HistoryDetailsModalModuleCssNamespace.IHistoryDetailsModalModuleCss;
};

export = HistoryDetailsModalModuleCssModule;
