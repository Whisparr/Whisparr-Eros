declare namespace ParseModalContentModuleCssNamespace {
  export interface IParseModalContentModuleCss {
    clearButton: string;
    helpText: string;
    input: string;
    inputContainer: string;
    inputIconContainer: string;
    loading: string;
    message: string;
    modalFooter: string;
  }
}

declare const ParseModalContentModuleCssModule: ParseModalContentModuleCssNamespace.IParseModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ParseModalContentModuleCssNamespace.IParseModalContentModuleCss;
};

export = ParseModalContentModuleCssModule;
