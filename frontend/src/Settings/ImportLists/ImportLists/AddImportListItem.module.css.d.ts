declare namespace AddImportListItemModuleCssNamespace {
  export interface IAddImportListItemModuleCss {
    actions: string;
    list: string;
    name: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
  }
}

declare const AddImportListItemModuleCssModule: AddImportListItemModuleCssNamespace.IAddImportListItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddImportListItemModuleCssNamespace.IAddImportListItemModuleCss;
};

export = AddImportListItemModuleCssModule;
