declare namespace SelectInputCssNamespace {
  export interface ISelectInputCss {
    hasError: string;
    hasWarning: string;
    isDisabled: string;
    select: string;
  }
}

declare const SelectInputCssModule: SelectInputCssNamespace.ISelectInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectInputCssNamespace.ISelectInputCss;
};

export = SelectInputCssModule;
