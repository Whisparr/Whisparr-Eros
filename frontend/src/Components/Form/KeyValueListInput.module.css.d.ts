declare namespace KeyValueListInputModuleCssNamespace {
  export interface IKeyValueListInputModuleCss {
    hasError: string;
    hasWarning: string;
    inputContainer: string;
    isFocused: string;
  }
}

declare const KeyValueListInputModuleCssModule: KeyValueListInputModuleCssNamespace.IKeyValueListInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: KeyValueListInputModuleCssNamespace.IKeyValueListInputModuleCss;
};

export = KeyValueListInputModuleCssModule;
