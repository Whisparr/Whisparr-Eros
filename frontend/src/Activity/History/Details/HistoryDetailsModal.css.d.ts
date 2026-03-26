declare namespace HistoryDetailsModalCssNamespace {
  export interface IHistoryDetailsModalCss {
    markAsFailedButton: string;
  }
}

declare const HistoryDetailsModalCssModule: HistoryDetailsModalCssNamespace.IHistoryDetailsModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HistoryDetailsModalCssNamespace.IHistoryDetailsModalCss;
};

export = HistoryDetailsModalCssModule;
