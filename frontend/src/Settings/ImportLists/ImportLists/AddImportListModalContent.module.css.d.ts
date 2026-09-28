declare namespace AddImportListModalContentModuleCssNamespace {
  export interface IAddImportListModalContentModuleCss {
    lists: string;
  }
}

declare const AddImportListModalContentModuleCssModule: AddImportListModalContentModuleCssNamespace.IAddImportListModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddImportListModalContentModuleCssNamespace.IAddImportListModalContentModuleCss;
};

export = AddImportListModalContentModuleCssModule;
