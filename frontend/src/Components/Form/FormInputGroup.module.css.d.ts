declare namespace FormInputGroupModuleCssNamespace {
  export interface IFormInputGroupModuleCss {
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

declare const FormInputGroupModuleCssModule: FormInputGroupModuleCssNamespace.IFormInputGroupModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormInputGroupModuleCssNamespace.IFormInputGroupModuleCss;
};

export = FormInputGroupModuleCssModule;
