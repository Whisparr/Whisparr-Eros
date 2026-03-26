declare namespace ExportCustomFormatModalContentCssNamespace {
  export interface IExportCustomFormatModalContentCss {
    button: string;
  }
}

declare const ExportCustomFormatModalContentCssModule: ExportCustomFormatModalContentCssNamespace.IExportCustomFormatModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ExportCustomFormatModalContentCssNamespace.IExportCustomFormatModalContentCss;
};

export = ExportCustomFormatModalContentCssModule;
