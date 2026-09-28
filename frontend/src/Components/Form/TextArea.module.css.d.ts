declare namespace TextAreaModuleCssNamespace {
  export interface ITextAreaModuleCss {
    hasError: string;
    hasWarning: string;
    input: string;
    readOnly: string;
  }
}

declare const TextAreaModuleCssModule: TextAreaModuleCssNamespace.ITextAreaModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TextAreaModuleCssNamespace.ITextAreaModuleCss;
};

export = TextAreaModuleCssModule;
