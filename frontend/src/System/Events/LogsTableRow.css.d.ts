declare namespace LogsTableRowCssNamespace {
  export interface ILogsTableRowCss {
    actions: string;
    debug: string;
    error: string;
    fatal: string;
    info: string;
    level: string;
    trace: string;
    warn: string;
  }
}

declare const LogsTableRowCssModule: LogsTableRowCssNamespace.ILogsTableRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LogsTableRowCssNamespace.ILogsTableRowCss;
};

export = LogsTableRowCssModule;
