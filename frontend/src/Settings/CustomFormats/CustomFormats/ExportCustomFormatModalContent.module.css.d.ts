declare namespace ExportCustomFormatModalContentModuleCssNamespace {
  export interface IExportCustomFormatModalContentModuleCss {
    button: string;
  }
}

declare const ExportCustomFormatModalContentModuleCssModule: ExportCustomFormatModalContentModuleCssNamespace.IExportCustomFormatModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ExportCustomFormatModalContentModuleCssNamespace.IExportCustomFormatModalContentModuleCss;
};

export = ExportCustomFormatModalContentModuleCssModule;
