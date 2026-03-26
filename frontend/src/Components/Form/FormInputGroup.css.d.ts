declare namespace FormInputGroupCssNamespace {
  export interface IFormInputGroupCss {
    helpLink: string;
    inputContainer: string;
    inputGroup: string;
    inputGroupContainer: string;
    inputUnit: string;
    inputUnitNumber: string;
    pendingChangesContainer: string;
    pendingChangesIcon: string;
  }
}

declare const FormInputGroupCssModule: FormInputGroupCssNamespace.IFormInputGroupCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormInputGroupCssNamespace.IFormInputGroupCss;
};

export = FormInputGroupCssModule;
