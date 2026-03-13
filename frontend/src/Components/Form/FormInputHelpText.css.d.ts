declare namespace FormInputHelpTextCssNamespace {
  export interface IFormInputHelpTextCss {
    details: string;
    helpText: string;
    isCheckInput: string;
    isError: string;
    isWarning: string;
    link: string;
  }
}

declare const FormInputHelpTextCssModule: FormInputHelpTextCssNamespace.IFormInputHelpTextCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormInputHelpTextCssNamespace.IFormInputHelpTextCss;
};

export = FormInputHelpTextCssModule;
