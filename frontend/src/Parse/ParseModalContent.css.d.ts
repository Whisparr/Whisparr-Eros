declare namespace ParseModalContentCssNamespace {
  export interface IParseModalContentCss {
    clearButton: string;
    helpText: string;
    input: string;
    inputContainer: string;
    inputIconContainer: string;
    message: string;
  }
}

declare const ParseModalContentCssModule: ParseModalContentCssNamespace.IParseModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ParseModalContentCssNamespace.IParseModalContentCss;
};

export = ParseModalContentCssModule;
