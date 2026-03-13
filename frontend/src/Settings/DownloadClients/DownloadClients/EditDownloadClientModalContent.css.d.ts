declare namespace EditDownloadClientModalContentCssNamespace {
  export interface IEditDownloadClientModalContentCss {
    deleteButton: string;
    message: string;
  }
}

declare const EditDownloadClientModalContentCssModule: EditDownloadClientModalContentCssNamespace.IEditDownloadClientModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditDownloadClientModalContentCssNamespace.IEditDownloadClientModalContentCss;
};

export = EditDownloadClientModalContentCssModule;
