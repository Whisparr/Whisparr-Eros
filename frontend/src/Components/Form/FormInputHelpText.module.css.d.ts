declare namespace FormInputHelpTextModuleCssNamespace {
  export interface IFormInputHelpTextModuleCss {
    details: string;
    helpText: string;
    isCheckInput: string;
    isError: string;
    isWarning: string;
    link: string;
  }
}

declare const FormInputHelpTextModuleCssModule: FormInputHelpTextModuleCssNamespace.IFormInputHelpTextModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormInputHelpTextModuleCssNamespace.IFormInputHelpTextModuleCss;
};

export = FormInputHelpTextModuleCssModule;
