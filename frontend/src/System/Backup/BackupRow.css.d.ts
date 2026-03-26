declare namespace BackupRowCssNamespace {
  export interface IBackupRowCss {
    actions: string;
    type: string;
  }
}

declare const BackupRowCssModule: BackupRowCssNamespace.IBackupRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: BackupRowCssNamespace.IBackupRowCss;
};

export = BackupRowCssModule;
