declare namespace CheckInputModuleCssNamespace {
  export interface ICheckInputModuleCss {
    checkbox: string;
    container: string;
    danger: string;
    helpText: string;
    input: string;
    isDisabled: string;
    isIndeterminate: string;
    isNotChecked: string;
    label: string;
    primary: string;
    success: string;
    warning: string;
  }
}

declare const CheckInputModuleCssModule: CheckInputModuleCssNamespace.ICheckInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CheckInputModuleCssNamespace.ICheckInputModuleCss;
};

export = CheckInputModuleCssModule;
