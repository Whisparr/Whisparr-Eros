declare namespace AddImportListItemCssNamespace {
  export interface IAddImportListItemCss {
    actions: string;
    list: string;
    name: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
  }
}

declare const AddImportListItemCssModule: AddImportListItemCssNamespace.IAddImportListItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddImportListItemCssNamespace.IAddImportListItemCss;
};

export = AddImportListItemCssModule;
