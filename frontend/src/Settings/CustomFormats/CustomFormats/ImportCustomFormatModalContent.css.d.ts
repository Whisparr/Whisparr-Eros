declare namespace ImportCustomFormatModalContentCssNamespace {
  export interface IImportCustomFormatModalContentCss {
    input: string;
  }
}

declare const ImportCustomFormatModalContentCssModule: ImportCustomFormatModalContentCssNamespace.IImportCustomFormatModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ImportCustomFormatModalContentCssNamespace.IImportCustomFormatModalContentCss;
};

export = ImportCustomFormatModalContentCssModule;
