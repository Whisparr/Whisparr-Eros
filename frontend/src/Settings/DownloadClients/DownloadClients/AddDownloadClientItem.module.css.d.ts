declare namespace AddDownloadClientItemModuleCssNamespace {
  export interface IAddDownloadClientItemModuleCss {
    actions: string;
    downloadClient: string;
    name: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
    underlay: string;
  }
}

declare const AddDownloadClientItemModuleCssModule: AddDownloadClientItemModuleCssNamespace.IAddDownloadClientItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddDownloadClientItemModuleCssNamespace.IAddDownloadClientItemModuleCss;
};

export = AddDownloadClientItemModuleCssModule;
