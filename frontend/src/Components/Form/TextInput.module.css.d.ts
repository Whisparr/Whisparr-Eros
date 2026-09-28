declare namespace TextInputModuleCssNamespace {
  export interface ITextInputModuleCss {
    hasButton: string;
    hasError: string;
    hasWarning: string;
    input: string;
    readOnly: string;
  }
}

declare const TextInputModuleCssModule: TextInputModuleCssNamespace.ITextInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TextInputModuleCssNamespace.ITextInputModuleCss;
};

export = TextInputModuleCssModule;
