declare namespace TextAreaCssNamespace {
  export interface ITextAreaCss {
    hasError: string;
    hasWarning: string;
    input: string;
    readOnly: string;
  }
}

declare const TextAreaCssModule: TextAreaCssNamespace.ITextAreaCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TextAreaCssNamespace.ITextAreaCss;
};

export = TextAreaCssModule;
