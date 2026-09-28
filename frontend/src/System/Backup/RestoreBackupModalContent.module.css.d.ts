declare namespace RestoreBackupModalContentModuleCssNamespace {
  export interface IRestoreBackupModalContentModuleCss {
    additionalInfo: string;
    mappings: string;
    names: string;
    sourceRoot: string;
    sources: string;
    sourcesContent: string;
    step: string;
    stepState: string;
    steps: string;
    version: string;
  }
}

declare const RestoreBackupModalContentModuleCssModule: RestoreBackupModalContentModuleCssNamespace.IRestoreBackupModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RestoreBackupModalContentModuleCssNamespace.IRestoreBackupModalContentModuleCss;
};

export = RestoreBackupModalContentModuleCssModule;
