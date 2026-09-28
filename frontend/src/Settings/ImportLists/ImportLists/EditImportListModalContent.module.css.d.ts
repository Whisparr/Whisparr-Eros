declare namespace EditImportListModalContentModuleCssNamespace {
  export interface IEditImportListModalContentModuleCss {
    deleteButton: string;
    labelIcon: string;
    message: string;
  }
}

declare const EditImportListModalContentModuleCssModule: EditImportListModalContentModuleCssNamespace.IEditImportListModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditImportListModalContentModuleCssNamespace.IEditImportListModalContentModuleCss;
};

export = EditImportListModalContentModuleCssModule;
