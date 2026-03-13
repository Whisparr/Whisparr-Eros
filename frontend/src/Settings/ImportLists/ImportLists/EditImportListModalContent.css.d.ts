declare namespace EditImportListModalContentCssNamespace {
  export interface IEditImportListModalContentCss {
    deleteButton: string;
    labelIcon: string;
    message: string;
  }
}

declare const EditImportListModalContentCssModule: EditImportListModalContentCssNamespace.IEditImportListModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditImportListModalContentCssNamespace.IEditImportListModalContentCss;
};

export = EditImportListModalContentCssModule;
