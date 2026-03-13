declare namespace LogFilesTableRowCssNamespace {
  export interface ILogFilesTableRowCss {
    download: string;
  }
}

declare const LogFilesTableRowCssModule: LogFilesTableRowCssNamespace.ILogFilesTableRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LogFilesTableRowCssNamespace.ILogFilesTableRowCss;
};

export = LogFilesTableRowCssModule;
