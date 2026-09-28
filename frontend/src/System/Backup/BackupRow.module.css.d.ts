declare namespace BackupRowModuleCssNamespace {
  export interface IBackupRowModuleCss {
    actions: string;
    type: string;
  }
}

declare const BackupRowModuleCssModule: BackupRowModuleCssNamespace.IBackupRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: BackupRowModuleCssNamespace.IBackupRowModuleCss;
};

export = BackupRowModuleCssModule;
