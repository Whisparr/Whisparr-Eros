declare namespace FormModuleCssNamespace {
  export interface IFormModuleCss {
    validationFailures: string;
  }
}

declare const FormModuleCssModule: FormModuleCssNamespace.IFormModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormModuleCssNamespace.IFormModuleCss;
};

export = FormModuleCssModule;
