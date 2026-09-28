declare namespace FormLabelModuleCssNamespace {
  export interface IFormLabelModuleCss {
    hasError: string;
    isAdvanced: string;
    label: string;
    large: string;
    small: string;
  }
}

declare const FormLabelModuleCssModule: FormLabelModuleCssNamespace.IFormLabelModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormLabelModuleCssNamespace.IFormLabelModuleCss;
};

export = FormLabelModuleCssModule;
