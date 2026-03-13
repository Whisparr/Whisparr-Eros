declare namespace FormLabelCssNamespace {
  export interface IFormLabelCss {
    hasError: string;
    isAdvanced: string;
    label: string;
    large: string;
    small: string;
  }
}

declare const FormLabelCssModule: FormLabelCssNamespace.IFormLabelCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FormLabelCssNamespace.IFormLabelCss;
};

export = FormLabelCssModule;
