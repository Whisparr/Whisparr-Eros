declare namespace AddImportListModalContentCssNamespace {
  export interface IAddImportListModalContentCss {
    lists: string;
  }
}

declare const AddImportListModalContentCssModule: AddImportListModalContentCssNamespace.IAddImportListModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddImportListModalContentCssNamespace.IAddImportListModalContentCss;
};

export = AddImportListModalContentCssModule;
