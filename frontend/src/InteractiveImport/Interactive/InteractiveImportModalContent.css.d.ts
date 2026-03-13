declare namespace InteractiveImportModalContentCssNamespace {
  export interface IInteractiveImportModalContentCss {
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

declare const InteractiveImportModalContentCssModule: InteractiveImportModalContentCssNamespace.IInteractiveImportModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InteractiveImportModalContentCssNamespace.IInteractiveImportModalContentCss;
};

export = InteractiveImportModalContentCssModule;
