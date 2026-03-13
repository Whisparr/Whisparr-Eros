declare namespace KeyValueListInputCssNamespace {
  export interface IKeyValueListInputCss {
    hasError: string;
    hasWarning: string;
    inputContainer: string;
    isFocused: string;
  }
}

declare const KeyValueListInputCssModule: KeyValueListInputCssNamespace.IKeyValueListInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: KeyValueListInputCssNamespace.IKeyValueListInputCss;
};

export = KeyValueListInputCssModule;
