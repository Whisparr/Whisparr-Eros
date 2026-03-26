declare namespace FormInputButtonCssNamespace {
  export interface IFormInputButtonCss {
    button: string;
    middleButton: string;
  }
}

declare const FormInputButtonCssModule: FormInputButtonCssNamespace.IFormInputButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormInputButtonCssNamespace.IFormInputButtonCss;
};

export = FormInputButtonCssModule;
