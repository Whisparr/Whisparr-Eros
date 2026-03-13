declare namespace CheckInputCssNamespace {
  export interface ICheckInputCss {
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

declare const CheckInputCssModule: CheckInputCssNamespace.ICheckInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CheckInputCssNamespace.ICheckInputCss;
};

export = CheckInputCssModule;
