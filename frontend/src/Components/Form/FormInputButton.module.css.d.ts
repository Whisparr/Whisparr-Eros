declare namespace FormInputButtonModuleCssNamespace {
  export interface IFormInputButtonModuleCss {
    button: string;
    middleButton: string;
  }
}

declare const FormInputButtonModuleCssModule: FormInputButtonModuleCssNamespace.IFormInputButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormInputButtonModuleCssNamespace.IFormInputButtonModuleCss;
};

export = FormInputButtonModuleCssModule;
