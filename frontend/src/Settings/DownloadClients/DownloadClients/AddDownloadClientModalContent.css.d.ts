declare namespace AddDownloadClientModalContentCssNamespace {
  export interface IAddDownloadClientModalContentCss {
    downloadClients: string;
  }
}

declare const AddDownloadClientModalContentCssModule: AddDownloadClientModalContentCssNamespace.IAddDownloadClientModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddDownloadClientModalContentCssNamespace.IAddDownloadClientModalContentCss;
};

export = AddDownloadClientModalContentCssModule;
