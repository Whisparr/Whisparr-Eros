declare namespace FieldSetModuleCssNamespace {
  export interface IFieldSetModuleCss {
    fieldSet: string;
    legend: string;
    small: string;
  }
}

declare const FieldSetModuleCssModule: FieldSetModuleCssNamespace.IFieldSetModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: FieldSetModuleCssNamespace.IFieldSetModuleCss;
};

export = FieldSetModuleCssModule;
