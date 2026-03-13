declare namespace TextInputCssNamespace {
  export interface ITextInputCss {
    hasButton: string;
    hasError: string;
    hasWarning: string;
    input: string;
    readOnly: string;
  }
}

declare const TextInputCssModule: TextInputCssNamespace.ITextInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TextInputCssNamespace.ITextInputCss;
};

export = TextInputCssModule;
