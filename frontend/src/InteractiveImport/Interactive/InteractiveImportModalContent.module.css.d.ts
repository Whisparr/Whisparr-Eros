declare namespace InteractiveImportModalContentModuleCssNamespace {
  export interface IInteractiveImportModalContentModuleCss {
    bulkSelect: string;
    deleteButton: string;
    errorMessage: string;
    filterContainer: string;
    filterText: string;
    footer: string;
    importMode: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const InteractiveImportModalContentModuleCssModule: InteractiveImportModalContentModuleCssNamespace.IInteractiveImportModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InteractiveImportModalContentModuleCssNamespace.IInteractiveImportModalContentModuleCss;
};

export = InteractiveImportModalContentModuleCssModule;
