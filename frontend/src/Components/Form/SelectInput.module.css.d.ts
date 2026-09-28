declare namespace SelectInputModuleCssNamespace {
  export interface ISelectInputModuleCss {
    hasError: string;
    hasWarning: string;
    isDisabled: string;
    select: string;
  }
}

declare const SelectInputModuleCssModule: SelectInputModuleCssNamespace.ISelectInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectInputModuleCssNamespace.ISelectInputModuleCss;
};

export = SelectInputModuleCssModule;
