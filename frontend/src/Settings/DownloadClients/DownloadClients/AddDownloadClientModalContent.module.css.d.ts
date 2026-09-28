declare namespace AddDownloadClientModalContentModuleCssNamespace {
  export interface IAddDownloadClientModalContentModuleCss {
    downloadClients: string;
  }
}

declare const AddDownloadClientModalContentModuleCssModule: AddDownloadClientModalContentModuleCssNamespace.IAddDownloadClientModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddDownloadClientModalContentModuleCssNamespace.IAddDownloadClientModalContentModuleCss;
};

export = AddDownloadClientModalContentModuleCssModule;
