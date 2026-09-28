declare namespace EditCustomFormatModalContentModuleCssNamespace {
  export interface IEditCustomFormatModalContentModuleCss {
    addSpecification: string;
    center: string;
    customFormats: string;
    deleteButton: string;
    rightButtons: string;
  }
}

declare const EditCustomFormatModalContentModuleCssModule: EditCustomFormatModalContentModuleCssNamespace.IEditCustomFormatModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditCustomFormatModalContentModuleCssNamespace.IEditCustomFormatModalContentModuleCss;
};

export = EditCustomFormatModalContentModuleCssModule;
