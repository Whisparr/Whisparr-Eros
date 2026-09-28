declare namespace LogFilesTableRowModuleCssNamespace {
  export interface ILogFilesTableRowModuleCss {
    download: string;
  }
}

declare const LogFilesTableRowModuleCssModule: LogFilesTableRowModuleCssNamespace.ILogFilesTableRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LogFilesTableRowModuleCssNamespace.ILogFilesTableRowModuleCss;
};

export = LogFilesTableRowModuleCssModule;
