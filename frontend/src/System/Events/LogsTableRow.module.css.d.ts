declare namespace LogsTableRowModuleCssNamespace {
  export interface ILogsTableRowModuleCss {
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

declare const LogsTableRowModuleCssModule: LogsTableRowModuleCssNamespace.ILogsTableRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LogsTableRowModuleCssNamespace.ILogsTableRowModuleCss;
};

export = LogsTableRowModuleCssModule;
