declare namespace AddDownloadClientItemCssNamespace {
  export interface IAddDownloadClientItemCss {
    actions: string;
    downloadClient: string;
    name: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
    underlay: string;
  }
}

declare const AddDownloadClientItemCssModule: AddDownloadClientItemCssNamespace.IAddDownloadClientItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddDownloadClientItemCssNamespace.IAddDownloadClientItemCss;
};

export = AddDownloadClientItemCssModule;
