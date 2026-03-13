declare namespace RestoreBackupModalContentCssNamespace {
  export interface IRestoreBackupModalContentCss {
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

declare const RestoreBackupModalContentCssModule: RestoreBackupModalContentCssNamespace.IRestoreBackupModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RestoreBackupModalContentCssNamespace.IRestoreBackupModalContentCss;
};

export = RestoreBackupModalContentCssModule;
