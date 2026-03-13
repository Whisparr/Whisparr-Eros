declare namespace EditCustomFormatModalContentCssNamespace {
  export interface IEditCustomFormatModalContentCss {
    addSpecification: string;
    center: string;
    customFormats: string;
    deleteButton: string;
    rightButtons: string;
  }
}

declare const EditCustomFormatModalContentCssModule: EditCustomFormatModalContentCssNamespace.IEditCustomFormatModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditCustomFormatModalContentCssNamespace.IEditCustomFormatModalContentCss;
};

export = EditCustomFormatModalContentCssModule;
