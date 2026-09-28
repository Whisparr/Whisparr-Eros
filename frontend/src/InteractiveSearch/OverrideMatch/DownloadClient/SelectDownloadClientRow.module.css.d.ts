declare namespace SelectDownloadClientRowModuleCssNamespace {
  export interface ISelectDownloadClientRowModuleCss {
    downloadClient: string;
  }
}

declare const SelectDownloadClientRowModuleCssModule: SelectDownloadClientRowModuleCssNamespace.ISelectDownloadClientRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectDownloadClientRowModuleCssNamespace.ISelectDownloadClientRowModuleCss;
};

export = SelectDownloadClientRowModuleCssModule;
