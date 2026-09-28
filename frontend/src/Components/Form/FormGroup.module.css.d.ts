declare namespace FormGroupModuleCssNamespace {
  export interface IFormGroupModuleCss {
    extraSmall: string;
    group: string;
    large: string;
    medium: string;
    small: string;
  }
}

declare const FormGroupModuleCssModule: FormGroupModuleCssNamespace.IFormGroupModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormGroupModuleCssNamespace.IFormGroupModuleCss;
};

export = FormGroupModuleCssModule;
