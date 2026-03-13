declare namespace LogsTableDetailsModalCssNamespace {
  export interface ILogsTableDetailsModalCss {
    detailsText: string;
  }
}

declare const LogsTableDetailsModalCssModule: LogsTableDetailsModalCssNamespace.ILogsTableDetailsModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LogsTableDetailsModalCssNamespace.ILogsTableDetailsModalCss;
};

export = LogsTableDetailsModalCssModule;
