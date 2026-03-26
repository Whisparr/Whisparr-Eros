declare namespace FormGroupCssNamespace {
  export interface IFormGroupCss {
    extraSmall: string;
    group: string;
    large: string;
    medium: string;
    small: string;
  }
}

declare const FormGroupCssModule: FormGroupCssNamespace.IFormGroupCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormGroupCssNamespace.IFormGroupCss;
};

export = FormGroupCssModule;
