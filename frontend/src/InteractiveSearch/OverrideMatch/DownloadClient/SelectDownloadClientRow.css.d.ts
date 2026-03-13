declare namespace SelectDownloadClientRowCssNamespace {
  export interface ISelectDownloadClientRowCss {
    downloadClient: string;
  }
}

declare const SelectDownloadClientRowCssModule: SelectDownloadClientRowCssNamespace.ISelectDownloadClientRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectDownloadClientRowCssNamespace.ISelectDownloadClientRowCss;
};

export = SelectDownloadClientRowCssModule;
