declare namespace KeyValueListInputItemCssNamespace {
  export interface IKeyValueListInputItemCss {
    buttonWrapper: string;
    itemContainer: string;
    keyInput: string;
    keyInputWrapper: string;
    valueInput: string;
    valueInputWrapper: string;
  }
}

declare const KeyValueListInputItemCssModule: KeyValueListInputItemCssNamespace.IKeyValueListInputItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: KeyValueListInputItemCssNamespace.IKeyValueListInputItemCss;
};

export = KeyValueListInputItemCssModule;
